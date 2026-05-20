<script>
	import { onMount, onDestroy, tick } from "svelte";
	import JSZM from "$lib/jszm.js";
	import { base } from "$app/paths";

	/** @type {{ gameId: string, romPath: string, gameName: string, gameSubtitle: string, themeColor?: 'primary'|'secondary'|'accent', coverImage?: string | null }} */
	let {
		gameId,
		romPath,
		gameName,
		gameSubtitle,
		themeColor = "accent",
		coverImage = null,
	} = $props();

	// ── Reactive UI state ────────────────────────────────────
	/** @type {Array<{id: number, type: 'received'|'sent'|'copyright', text: string}>} */
	let messages = $state([]);
	let commandValue = $state("");
	let isWaitingForInput = $state(false);
	let isSendDisabled = $state(false);
	let fabHidden = $state(true);
	let isVoiceModeActive = $state(false);

	// ── DOM refs ─────────────────────────────────────────────
	/** @type {HTMLDivElement} */
	let messageAreaEl;
	/** @type {HTMLInputElement} */
	let commandInputEl;
	/** @type {HTMLDivElement} */
	let phoneContainerEl;
	/** @type {HTMLDivElement} */
	let inputAreaEl;

	// ── Visual Viewport state ────────────────────────────────

	// ── Engine state (non-reactive) ───────────────────────────
	let jszm = null;
	let runner = null;
	let textBuffer = "";
	let justSaved = false;
	let justRestored = false;
	let isAutoSaving = false;
	let isAutoRestoring = false;
	let isWaitingForRestart = false;
	let msgIdCounter = 0;
	let wakeLock = null;
	let isListening = $state(false);
	let recognition = null;

	const saveKey = $derived(`${gameId}-save`);
	const historyKey = $derived(`${gameId}-history`);
	// ── Theme color mapping ──────────────────────────────────
	const themeBgColor = $derived(
		themeColor === "primary"
			? "var(--color-primary)"
			: themeColor === "secondary"
				? "var(--color-secondary)"
				: "var(--color-accent)",
	);

	const themeContentColor = $derived(
		themeColor === "primary"
			? "var(--color-primary-content)"
			: themeColor === "secondary"
				? "var(--color-secondary-content)"
				: "var(--color-accent-content)",
	);

	// ── Helpers ───────────────────────────────────────────────
	function isMobileDevice() {
		// More strict: check user agent OR (small window AND touch)
		const ua = navigator.userAgent.toLowerCase();
		const isMobileUA =
			/android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(
				ua,
			);
		const isSmallAndTouch =
			window.innerWidth <= 800 &&
			("ontouchstart" in window || navigator.maxTouchPoints > 0);
		return isMobileUA || isSmallAndTouch;
	}

	function scrollToBottom(smooth = false) {
		if (!messageAreaEl) return;
		if (smooth) {
			messageAreaEl.scrollTo({
				top: messageAreaEl.scrollHeight,
				behavior: "smooth",
			});
		} else {
			messageAreaEl.scrollTop = messageAreaEl.scrollHeight;
		}
		updateScrollFab();
	}

	function updateScrollFab() {
		if (!messageAreaEl) return;
		const distFromBottom =
			messageAreaEl.scrollHeight -
			messageAreaEl.scrollTop -
			messageAreaEl.clientHeight;
		fabHidden = distFromBottom < 100;
	}

	function addMessage(text, type = "received") {
		if (!text.trim()) return;
		const trimmedText = text.trim();
		/** @type {any} */
		let msg;
		if (type === "received") {
			const lines = trimmedText.split("\n");
			if (lines.length > 1) {
				msg = { id: ++msgIdCounter, type, text: trimmedText };
				// Do not blur on mobile to avoid iOS search/find bubble
				if (!isMobileDevice()) {
					commandInputEl?.blur();
					commandInputEl?.focus();
				}
			} else {
				msg = { id: ++msgIdCounter, type, text: trimmedText };
			}
		} else {
			msg = { id: ++msgIdCounter, type, text: trimmedText };
		}
		messages = [...messages, msg];
		tick().then(() => scrollToBottom());
	}

	async function addCopyright(text) {
		messages = [
			...messages,
			{ id: ++msgIdCounter, type: "copyright", text },
		];
		await tick();
		scrollToBottom();
	}

	// ── Z-Machine logic ───────────────────────────────────────
	function flushBuffer() {
		if (!textBuffer) return;
		let text = textBuffer;
		// Strip trailing Z-machine prompt ">"
		text = text.replace(/\n?>\s*$/, "");
		textBuffer = "";

		if (justSaved || justRestored) {
			justSaved = false;
			justRestored = false;
			if (text.trim() === "Ok.") return;
		}

		if (!text.trim()) return;

		let textToSpeak = "";

		// Split copyright header from first room description
		const serialRegex = /(Serial number \d{6})(?:\s*\n)+/;
		const match = text.match(serialRegex);
		if (match) {
			const splitIndex = match.index + match[0].length;
			const part2 = text.substring(splitIndex).trim();
			addCopyright(
				"© 1980–1982 Infocom, Inc. Zork is a registered trademark of Activision Publishing, Inc.",
			);
			if (part2) {
				addMessage(part2, "received");
				textToSpeak = part2;
			}
		} else {
			addMessage(text, "received");
			textToSpeak = text;
		}

		if (isVoiceModeActive && textToSpeak) {
			speakAndListen(textToSpeak);
		}
	}

	function runMachine(resumeValue) {
		if (!runner) return;
		try {
			let result = runner.next(resumeValue);
			while (!result.done) {
				if (result.value && result.value.type === "waitForInput") {
					// If we are auto-restoring, send the restore command, then continue
					if (isAutoRestoring) {
						isAutoRestoring = false;
						textBuffer = "";
						setTimeout(() => {
							// Send the restore command, then re-enter runMachine
							runMachine("restore\n");
						}, 0);
						return;
					}

					isWaitingForInput = true;
					flushBuffer();

					if (isAutoSaving) {
						isAutoSaving = false;
					} else if (justRestored) {
						// After restoring, just enable input and return
						justRestored = false;
						return;
					} else {
						isAutoSaving = true;
						isWaitingForInput = false;
						setTimeout(() => runMachine("save\n"), 0);
					}
					return;
				}
				result = runner.next();
			}
			if (result.done) {
				flushBuffer();
				addMessage("--- GAME OVER ---", "received");
			}
		} catch (e) {
			console.error("Z-Machine Error:", e);
			addMessage("Error: " + e.message, "received");
		}
	}

	// ── Form submit handler ───────────────────────────────────
	function handleSubmit(e) {
		if (e) e.preventDefault();
		const command = commandValue.trim();
		if (!command) return;

		if ("vibrate" in navigator) navigator.vibrate(10);

		addMessage(command, "sent");
		commandValue = "";

		if (isWaitingForRestart) {
			isWaitingForRestart = false;
			const normalized = command.toLowerCase();
			if (normalized === "yes" || normalized === "y") {
				addMessage("Restarting…", "received");
				speakAndListen("Restarting…");
				localStorage.removeItem(saveKey);
				localStorage.removeItem(historyKey);
				setTimeout(() => location.reload(), 1000);
			} else {
				addMessage("Game continuing…", "received");
				speakAndListen("Game continuing…");
			}
			return;
		}

		const normalizedCmd = command.toLowerCase();
		if (normalizedCmd === "reset" || normalizedCmd === "restart") {
			isWaitingForRestart = true;
			const resetMsg =
				"Start a new game? This will clear all progress and your save. Say yes to begin again.";
			addMessage(resetMsg, "received");
			speakAndListen(resetMsg);
			return;
		}

		if (isWaitingForInput) {
			isWaitingForInput = false;
			isSendDisabled = true;
			setTimeout(() => {
				runMachine(command + "\n");
				isSendDisabled = false;
			}, 500);
		} else {
			console.warn("Engine not ready for input");
		}

		if (isMobileDevice()) {
			commandInputEl?.blur();
		} else {
			commandInputEl?.focus();
		}
	}

	// ── Voice Mode Logic ──────────────────────────────────────
	function stopVoiceMode() {
		isVoiceModeActive = false;
		window.speechSynthesis.cancel();
		isListening = false;
		if (recognition) recognition.abort();
		if (wakeLock) {
			wakeLock.release().catch(console.error);
			wakeLock = null;
		}
	}

	function toggleVoiceMode() {
		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		if (!SpeechRecognition) {
			addMessage(
				"Voice mode is not supported in this browser.",
				"received",
			);
			return;
		}

		if (!isVoiceModeActive) {
			isVoiceModeActive = true;

			// Read last received message to kick off loop, or a greeting
			const lastReceived = messages
				.slice()
				.reverse()
				.find(
					(m) =>
						m.type === "received" && m.text !== "--- GAME OVER ---",
				);
			if (lastReceived) {
				speakAndListen(lastReceived.text);
			} else {
				speakAndListen("Voice mode activated. What now?");
			}

			if ("wakeLock" in navigator) {
				navigator.wakeLock.request("screen").then(lock => {
					wakeLock = lock;
				}).catch(err => {
					console.warn("Wake Lock request failed:", err);
				});
			}
		} else {
			stopVoiceMode();
		}
	}

	function speakAndListen(text) {
		if (!isVoiceModeActive) return;

		window.speechSynthesis.cancel();

		// Strip out HTML tags just in case
		const plainText = text.replace(/<[^>]*>?/gm, "");
		const utterance = new SpeechSynthesisUtterance(plainText);

		utterance.onend = () => {
			if (!isVoiceModeActive) return;
			setTimeout(() => {
				startListening();
			}, 800);
		};

		utterance.onerror = (e) => {
			console.warn("Speech synthesis error:", e);
			if (isVoiceModeActive && !window.speechSynthesis.speaking) startListening();
		};

		if (recognition) {
			recognition.abort();
		}
		window.speechSynthesis.speak(utterance);
	}

	function startListening() {
		if (!isVoiceModeActive || isListening) return;

		const SpeechRecognition =
			window.SpeechRecognition || window.webkitSpeechRecognition;
		const SpeechGrammarList =
			window.SpeechGrammarList || window.webkitSpeechGrammarList;
		if (!SpeechRecognition) return;

		recognition = new SpeechRecognition();

		if (SpeechGrammarList) {
			const vocabulary = [
				// Directions
				"n",
				"s",
				"e",
				"w",
				"ne",
				"nw",
				"se",
				"sw",
				"u",
				"d",
				"north",
				"south",
				"east",
				"west",
				"northeast",
				"northwest",
				"southeast",
				"southwest",
				"up",
				"down",
				"enter",
				"exit",
				"in",
				"out",
				"climb",
				"cross",
				// Verbs
				"get",
				"take",
				"drop",
				"put",
				"open",
				"close",
				"read",
				"look",
				"examine",
				"turn on",
				"turn off",
				"move",
				"attack",
				"kill",
				"burn",
				"tie",
				"untie",
				"inventory",
				"score",
				"diagnose",
				"wait",
				"again",
				"save",
				"restore",
				// Nouns
				"lamp",
				"lantern",
				"sword",
				"mailbox",
				"leaflet",
				"troll",
				"grue",
				"sack",
				"bottle",
				"water",
				"case",
				"house",
				"window",
				"door",
				"key",
				"all",
			];
			const grammar =
				"#JSGF V1.0; grammar zork; public <command> = " +
				vocabulary.join(" | ") +
				" ;";
			const speechRecognitionList = new SpeechGrammarList();
			speechRecognitionList.addFromString(grammar, 1);
			recognition.grammars = speechRecognitionList;
		}

		recognition.continuous = false;
		recognition.interimResults = false;

		recognition.onstart = () => {
			isListening = true;
		};

		recognition.onresult = (event) => {
			isListening = false;
			if (!isVoiceModeActive) return;
			const transcript = event.results[0][0].transcript;
			commandValue = transcript;
			handleSubmit();
		};

		recognition.onabort = () => {
			isListening = false;
		};

		recognition.onend = () => {
			isListening = false;
			// Gracefully restart if still active and not speaking
			if (isVoiceModeActive && !window.speechSynthesis.speaking) {
				startListening();
			}
		};

		recognition.onerror = (event) => {
			console.warn("Speech recognition error:", event.error);
			isListening = false;
			// onend will fire and restart it
		};

		try {
			recognition.start();
		} catch (e) {
			console.warn("Could not start recognition:", e);
			isListening = false;
		}
	}

	function handleVisibilityChange() {
		if (document.visibilityState === "hidden" && isVoiceModeActive) {
			stopVoiceMode();
		} else if (document.visibilityState === "visible" && isVoiceModeActive) {
			if ("wakeLock" in navigator) {
				navigator.wakeLock
					.request("screen")
					.then((lock) => {
						wakeLock = lock;
					})
					.catch(console.warn);
			}
		}
	}

	// ── Viewport / keyboard resize (mobile) ───────────────────
	function handleViewportResize() {
		if (!isMobileDevice()) return;
		window.scrollTo(0, 0);
		if (window.visualViewport && phoneContainerEl) {
			const viewport = window.visualViewport;
			const keyboardHeight = window.innerHeight - viewport.height;
			phoneContainerEl.style.paddingBottom =
				keyboardHeight > 0 ? `${keyboardHeight}px` : "0";
			phoneContainerEl.style.top = `${viewport.offsetTop}px`;
		}
		requestAnimationFrame(() => {
			scrollToBottom();
		});
	}

	// ── Initialise engine ─────────────────────────────────────
	async function init() {
		try {
			const response = await fetch(romPath);
			if (!response.ok) throw new Error(`Failed to load ROM: ${romPath}`);
			const buffer = await response.arrayBuffer();

			jszm = new JSZM(new Uint8Array(buffer));

			jszm.print = function* (text) {
				textBuffer += text;
			};

			jszm.read = function* (maxlen) {
				return yield { type: "waitForInput", maxlen };
			};

			jszm.updateStatusLine = function* (_text, _left, _right) {
				// Status line intentionally omitted from chat UI
			};

			jszm.save = function* (data) {
				try {
					const binary = String.fromCharCode.apply(null, data);
					const base64 = btoa(binary);
					localStorage.setItem(saveKey, base64);
					localStorage.setItem(historyKey, JSON.stringify(messages));
					justSaved = true;
					return 1;
				} catch (err) {
					console.error("Save failed", err);
					return 0;
				}
			};

			jszm.restore = function* () {
				try {
					const base64 = localStorage.getItem(saveKey);
					if (!base64) return null;
					const binary = atob(base64);
					const data = new Uint8Array(binary.length);
					for (let i = 0; i < binary.length; i++)
						data[i] = binary.charCodeAt(i);
					justRestored = true;
					return data;
				} catch (err) {
					console.error("Restore failed", err);
					return null;
				}
			};

			runner = jszm.run();

			// Restore previous session if a save exists
			if (localStorage.getItem(saveKey)) {
				isAutoRestoring = true;
				const history = localStorage.getItem(historyKey);
				if (history) {
					try {
						const parsed = JSON.parse(history);
						messages = parsed;
						msgIdCounter =
							parsed.length > 0
								? Math.max(...parsed.map((m) => m.id))
								: 0;
						await tick();
						scrollToBottom();
					} catch {
						// Corrupt history — start fresh
					}
				}
			}

			runMachine();
			await tick();
			scrollToBottom();
		} catch (err) {
			addMessage("Failed to initialize game: " + err.message, "received");
			console.error(err);
		}
	}

	// ── Lifecycle ─────────────────────────────────────────────
	onMount(() => {
		document.body.classList.add("game-active");

		if (window.visualViewport) {
			window.visualViewport.addEventListener(
				"resize",
				handleViewportResize,
			);
			window.visualViewport.addEventListener(
				"scroll",
				handleViewportResize,
			);
			// Initial adjustment
			handleViewportResize();
		} else {
			window.addEventListener("resize", handleViewportResize);
		}

		document.addEventListener("visibilitychange", handleVisibilityChange);

		commandInputEl?.addEventListener("focus", () => {
			// Multiple scrollToBottom attempts for keyboard open
			scrollToBottom();
			setTimeout(scrollToBottom, 100);
			setTimeout(scrollToBottom, 300);
			setTimeout(scrollToBottom, 500);
			setTimeout(handleViewportResize, 100);
			setTimeout(handleViewportResize, 300);
			setTimeout(handleViewportResize, 500);
		});

		commandInputEl?.addEventListener("blur", () => {
			// Restore container height/top and transform when keyboard closes
			const restoreAndScroll = () => {
				if (
					window.visualViewport &&
					phoneContainerEl &&
					isMobileDevice()
				) {
					phoneContainerEl.style.height = "100dvh";
					phoneContainerEl.style.top = "0";
					phoneContainerEl.style.transform = "none";
				}
				scrollToBottom();
			};
			// Multiple scrollToBottom attempts for keyboard close
			scrollToBottom();
			setTimeout(restoreAndScroll, 10);
			setTimeout(restoreAndScroll, 100);
			setTimeout(restoreAndScroll, 300);
			setTimeout(restoreAndScroll, 500);
			setTimeout(scrollToBottom, 100);
			setTimeout(scrollToBottom, 300);
			setTimeout(scrollToBottom, 500);
		});

		if (!isMobileDevice()) commandInputEl?.focus();

		init();
	});

	onDestroy(() => {
		document.body.classList.remove("game-active");
		stopVoiceMode();
		if (window.visualViewport) {
			window.visualViewport.removeEventListener(
				"resize",
				handleViewportResize,
			);
			window.visualViewport.removeEventListener(
				"scroll",
				handleViewportResize,
			);
		} else {
			window.removeEventListener("resize", handleViewportResize);
		}
		document.removeEventListener(
			"visibilitychange",
			handleVisibilityChange,
		);
	});
</script>

<div
	class="phone-container bg-base-100 text-base-content"
	bind:this={phoneContainerEl}
	style="--theme-accent: {themeBgColor}; --theme-accent-content: {themeContentColor};"
>
	<!-- Header (single instance, with Home button) -->
	<div class="app-header border-base-200">
		<a
			href="{base}/"
			class="btn btn-ghost btn-xs absolute left-3 top-1/2 -translate-y-1/2"
			title="Back to home"
		>
			<i class="fas fa-home text-sm"></i>
		</a>
		<button
			class="btn btn-ghost btn-xs absolute right-3 top-1/2 -translate-y-1/2"
			title="Toggle Voice Mode"
			onclick={toggleVoiceMode}
			aria-pressed={isVoiceModeActive}
		>
			<i
				class="fas {isVoiceModeActive
					? 'fa-phone-slash'
					: 'fa-phone'} text-sm {isVoiceModeActive
					? 'text-error'
					: ''}"
			></i>
		</button>
		<div class="avatar-container">
			<div class="avatar">
				<div class="w-12 h-12 rounded-full overflow-hidden">
					{#if coverImage}
						<img
							src={coverImage}
							alt="{gameName} cover"
							class="object-cover w-full h-full"
						/>
					{:else}
						<div
							class="w-full h-full flex items-center justify-center bg-gradient-to-br from-amber-600 to-amber-400 text-base-100 font-bold text-xs"
						>
							{gameId.toUpperCase()}
						</div>
					{/if}
				</div>
			</div>
		</div>
		<div class="contact-info">
			<div class="name">{gameName}</div>
			<div class="subtitle">{gameSubtitle}</div>
		</div>
	</div>

	<!-- Message area -->
	<div
		class="message-area bg-base-200/30 message-font-fix"
		id="message-area"
		bind:this={messageAreaEl}
		onscroll={updateScrollFab}
		role="log"
		aria-live="polite"
		aria-label="Game output"
	>
		{#each messages as msg (msg.id)}
			{#if msg.type === "copyright"}
				<p class="message-copyright">{msg.text}</p>
			{:else}
				<div
					class="message-item {msg.type === 'sent'
						? 'message-sent'
						: 'message-received'}"
				>
					{@html msg.text}
				</div>
			{/if}
		{/each}
	</div>

	<!-- Scroll-to-bottom FAB -->
	<button
		class="scroll-fab btn btn-circle btn-sm btn-neutral shadow-lg {fabHidden
			? 'fab-hidden'
			: ''}"
		onclick={() => scrollToBottom(true)}
		aria-label="Scroll to bottom"
		tabindex={fabHidden ? -1 : 0}
	>
		<i class="fas fa-chevron-down text-neutral-content"></i>
	</button>

	<!-- Input area -->
	<div class="input-area border-base-200 bg-base-100" bind:this={inputAreaEl}>
		<div
			class="input-wrapper flex items-center gap-2 p-1 rounded-full w-full bg-base-200 {isListening ? 'listening-glow' : ''}"
		>
			<form
				id="input-form"
				role="presentation"
				action="javascript:void(0);"
				class="flex-1"
				onsubmit={handleSubmit}
			>
				<textarea
					rows="1"
					name="command"
					id="zmachine-command"
					placeholder={isListening ? "Listening..." : "What now?"}
					bind:value={commandValue}
					bind:this={commandInputEl}
					autocomplete="off"
					autocorrect="off"
					autocapitalize="none"
					spellcheck="false"
					enterkeyhint="send"
					inputmode="text"
					onkeydown={(e) => {
						if (e.key === "Enter" && !e.shiftKey) {
							e.preventDefault();
							handleSubmit(e);
						}
					}}
					class="input input-ghost input-font-fix resize-none py-2 flex-1 focus:bg-transparent focus:outline-none border-none"
					aria-label="Command input"
				></textarea>
			</form>
			<button
				type="button"
				disabled={isSendDisabled}
				class="btn btn-circle btn-md"
				class:btn-accent={themeColor === "accent"}
				class:btn-secondary={themeColor === "secondary"}
				class:btn-primary={themeColor === "primary"}
				aria-label="Send command"
				onclick={handleSubmit}
			>
				<i class="fas fa-arrow-up text-primary-content"></i>
			</button>
		</div>
	</div>

	<div class="home-indicator"></div>
</div>
