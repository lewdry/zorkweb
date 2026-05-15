<script>
import './ZPlayer.iosfix.css';
	import { onMount, onDestroy, tick } from 'svelte';
	import JSZM from '$lib/jszm.js';
	import { base } from '$app/paths';

	/** @type {{ gameId: string, romPath: string, gameName: string, gameSubtitle: string, themeColor?: 'primary'|'secondary'|'accent', coverImage?: string | null }} */
	let { gameId, romPath, gameName, gameSubtitle, themeColor = 'accent', coverImage = null } = $props();

	// ── Reactive UI state ────────────────────────────────────
	/** @type {Array<{id: number, type: 'received'|'sent'|'copyright', text: string, titleLine?: string}>} */
	let messages = $state([]);
	let commandValue = $state('');
	let isWaitingForInput = $state(false);
	let isSendDisabled = $state(false);
	let fabHidden = $state(true);
	let inputMode = $state('none');
// ── Input focus handler for iOS accessory bar hack ───────
function handleInputFocus() {
	inputMode = 'text';
}

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
	let textBuffer = '';
	let justSaved = false;
	let justRestored = false;
	let isAutoSaving = false;
	let isAutoRestoring = false;
	let isWaitingForRestart = false;
	let msgIdCounter = 0;

	const saveKey = $derived(`${gameId}-save`);
	const historyKey = $derived(`${gameId}-history`);
	// ── Theme color mapping ──────────────────────────────────
	const themeBgColor = $derived(
		themeColor === 'primary'
			? 'var(--color-primary)'
			: themeColor === 'secondary'
				? 'var(--color-secondary)'
				: 'var(--color-accent)'
	);

	const themeContentColor = $derived(
		themeColor === 'primary'
			? 'var(--color-primary-content)'
			: themeColor === 'secondary'
				? 'var(--color-secondary-content)'
				: 'var(--color-accent-content)'
	);

	// ── Helpers ───────────────────────────────────────────────
	function isMobileDevice() {
		// More strict: check user agent OR (small window AND touch)
		const ua = navigator.userAgent.toLowerCase();
		const isMobileUA = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
		const isSmallAndTouch = window.innerWidth <= 800 && ('ontouchstart' in window || navigator.maxTouchPoints > 0);
		return isMobileUA || isSmallAndTouch;
	}

	function scrollToBottom(smooth = false) {
		if (!messageAreaEl) return;
		if (smooth) {
			messageAreaEl.scrollTo({ top: messageAreaEl.scrollHeight, behavior: 'smooth' });
		} else {
			messageAreaEl.scrollTop = messageAreaEl.scrollHeight;
		}
		updateScrollFab();
	}

	function updateScrollFab() {
		if (!messageAreaEl) return;
		const distFromBottom =
			messageAreaEl.scrollHeight - messageAreaEl.scrollTop - messageAreaEl.clientHeight;
		fabHidden = distFromBottom < 100;
	}

	function addMessage(text, type = 'received') {
		if (!text.trim()) return;
		const trimmedText = text.trim();
		/** @type {any} */
		let msg;
		if (type === 'received') {
			const lines = trimmedText.split('\n');
			if (lines.length > 1) {
				msg = {
					id: ++msgIdCounter,
					type,
					titleLine: lines[0],
					text: lines.slice(1).join('\n').trim()
				};
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
		messages = [...messages, { id: ++msgIdCounter, type: 'copyright', text }];
		await tick();
		scrollToBottom();
	}

	// ── Z-Machine logic ───────────────────────────────────────
	function flushBuffer() {
		if (!textBuffer) return;
		let text = textBuffer;
		// Strip trailing Z-machine prompt ">"
		text = text.replace(/\n?>\s*$/, '');
		textBuffer = '';

		if (justSaved || justRestored) {
			justSaved = false;
			justRestored = false;
			if (text.trim() === 'Ok.') return;
		}

		if (!text.trim()) return;

		// Split copyright header from first room description
		const serialRegex = /(Serial number \d{6})(?:\s*\n)+/;
		const match = text.match(serialRegex);
		if (match) {
			const splitIndex = match.index + match[0].length;
			const part2 = text.substring(splitIndex).trim();
			addCopyright(
				'© 1980–1982 Infocom, Inc. Zork is a registered trademark of Activision Publishing, Inc.'
			);
			if (part2) addMessage(part2, 'received');
		} else {
			addMessage(text, 'received');
		}
	}

	function runMachine(resumeValue) {
		if (!runner) return;
		try {
			let result = runner.next(resumeValue);
			while (!result.done) {
				if (result.value && result.value.type === 'waitForInput') {
					isWaitingForInput = true;

					if (isAutoRestoring) {
						textBuffer = '';
						isAutoRestoring = false;
						isWaitingForInput = false;
						setTimeout(() => runMachine('restore\n'), 0);
						return;
					}

					flushBuffer();

					if (isAutoSaving) {
						isAutoSaving = false;
					} else {
						isAutoSaving = true;
						isWaitingForInput = false;
						setTimeout(() => runMachine('save\n'), 0);
					}
					return;
				}
				result = runner.next();
			}
			if (result.done) {
				flushBuffer();
				addMessage('--- GAME OVER ---', 'received');
			}
		} catch (e) {
			console.error('Z-Machine Error:', e);
			addMessage('Error: ' + e.message, 'received');
		}
	}

	// ── Form submit handler ───────────────────────────────────
	function handleSubmit(e) {
		e.preventDefault();
		const command = commandValue.trim();
		if (!command) return;

		if ('vibrate' in navigator) navigator.vibrate(10);

		addMessage(command, 'sent');
		commandValue = '';

		if (isWaitingForRestart) {
			isWaitingForRestart = false;
			const normalized = command.toLowerCase();
			if (normalized === 'yes' || normalized === 'y') {
				addMessage('Restarting…', 'received');
				localStorage.removeItem(saveKey);
				localStorage.removeItem(historyKey);
				setTimeout(() => location.reload(), 1000);
			} else {
				addMessage('Game continuing…', 'received');
			}
			return;
		}

		const normalizedCmd = command.toLowerCase();
		if (normalizedCmd === 'reset' || normalizedCmd === 'restart') {
			isWaitingForRestart = true;
			addMessage(
				'Start a new game? This will clear all progress and your save. Say yes to begin again.',
				'received'
			);
			return;
		}

		if (isWaitingForInput) {
			isWaitingForInput = false;
			isSendDisabled = true;
			setTimeout(() => {
				runMachine(command + '\n');
				isSendDisabled = false;
			}, 500);
		} else {
			console.warn('Engine not ready for input');
		}

		if (isMobileDevice()) {
			commandInputEl?.blur();
		} else {
			commandInputEl?.focus();
		}
	}

	// ── Viewport / keyboard resize (mobile) ───────────────────
	function handleViewportResize() {
		       if (!isMobileDevice()) return;
		       window.scrollTo(0, 0);
		       if (window.visualViewport && phoneContainerEl) {
			       const viewport = window.visualViewport;
			       const keyboardHeight = window.innerHeight - viewport.height;
			       phoneContainerEl.style.paddingBottom = keyboardHeight > 0 ? `${keyboardHeight}px` : '0';
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
				return yield { type: 'waitForInput', maxlen };
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
					console.error('Save failed', err);
					return 0;
				}
			};

			jszm.restore = function* () {
				try {
					const base64 = localStorage.getItem(saveKey);
					if (!base64) return null;
					const binary = atob(base64);
					const data = new Uint8Array(binary.length);
					for (let i = 0; i < binary.length; i++) data[i] = binary.charCodeAt(i);
					justRestored = true;
					return data;
				} catch (err) {
					console.error('Restore failed', err);
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
						msgIdCounter = parsed.length > 0 ? Math.max(...parsed.map((m) => m.id)) : 0;
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
			addMessage('Failed to initialize game: ' + err.message, 'received');
			console.error(err);
		}
	}

	// ── Lifecycle ─────────────────────────────────────────────
	onMount(() => {
		document.body.classList.add('game-active');


		if (window.visualViewport) {
			window.visualViewport.addEventListener('resize', handleViewportResize);
			window.visualViewport.addEventListener('scroll', handleViewportResize);
			// Initial adjustment
			handleViewportResize();
		} else {
			window.addEventListener('resize', handleViewportResize);
		}



		commandInputEl?.addEventListener('focus', () => {
			// Multiple scrollToBottom attempts for keyboard open
			scrollToBottom();
			setTimeout(scrollToBottom, 100);
			setTimeout(scrollToBottom, 300);
			setTimeout(scrollToBottom, 500);
			setTimeout(handleViewportResize, 100);
			setTimeout(handleViewportResize, 300);
			setTimeout(handleViewportResize, 500);
		});

		commandInputEl?.addEventListener('blur', () => {
			// Restore container height/top and transform when keyboard closes
			const restoreAndScroll = () => {
				if (window.visualViewport && phoneContainerEl) {
					phoneContainerEl.style.height = '100dvh';
					phoneContainerEl.style.top = '0';
					phoneContainerEl.style.transform = 'none';
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
		document.body.classList.remove('game-active');
		if (window.visualViewport) {
			window.visualViewport.removeEventListener('resize', handleViewportResize);
			window.visualViewport.removeEventListener('scroll', handleViewportResize);
		} else {
			window.removeEventListener('resize', handleViewportResize);
		}
	});
</script>

<div
	class="phone-container bg-base-100 text-base-content"
	bind:this={phoneContainerEl}
	style="--theme-accent: {themeBgColor}; --theme-accent-content: {themeContentColor};"
>
	<!-- Header (single instance, with Home button) -->
	<div class="app-header border-base-200">
		<a href="{base}/" class="btn btn-ghost btn-xs absolute left-3 top-1/2 -translate-y-1/2" title="Back to home">
			<i class="fas fa-home text-sm"></i>
		</a>
		<div class="avatar-container">
			<div class="avatar">
				<div class="w-12 h-12 rounded-full overflow-hidden">
					{#if coverImage}
						<img src={coverImage} alt="{gameName} cover" class="object-cover w-full h-full" />
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
			{#if msg.type === 'copyright'}
				<p class="message-copyright">{msg.text}</p>
			{:else}
				<div class="message-item {msg.type === 'sent' ? 'message-sent' : 'message-received'}">
					{#if msg.titleLine}
						<span class="font-bold block mb-1">{msg.titleLine}</span>
						{#if msg.text}<span>{msg.text}</span>{/if}
					{:else}
						{msg.text}
					{/if}
				</div>
			{/if}
		{/each}
	</div>

	<!-- Scroll-to-bottom FAB -->
	<button
		class="scroll-fab btn btn-circle btn-sm btn-neutral shadow-lg {fabHidden ? 'fab-hidden' : ''}"
		onclick={() => scrollToBottom(true)}
		aria-label="Scroll to bottom"
		tabindex={fabHidden ? -1 : 0}
	>
		<i class="fas fa-chevron-down text-neutral-content"></i>
	</button>


	<!-- Input area -->
	<div class="input-area border-base-200 bg-base-100" bind:this={inputAreaEl}>
		<form
			id="input-form"
			role="presentation"
			action="javascript:void(0);"
			class="bg-base-200 flex items-center gap-2 p-1 rounded-full w-full"
			onsubmit={handleSubmit}
		>
			<!-- No <label> for input, only aria-label for accessibility -->
			<textarea
				rows="1"
				bind:value={commandValue}
				bind:this={commandInputEl}
				on:keydown={(e) => {
					if (e.key === 'Enter') {
						e.preventDefault();
						handleSubmit(e);
					}
				}}
				class="input input-ghost input-font-fix resize-none py-2 flex-1 focus:bg-transparent focus:outline-none border-none"
				aria-label="Command input"
				on:focus={handleInputFocus}
			></textarea>
			<button
				type="submit"
				disabled={isSendDisabled}
				class="btn btn-circle btn-sm"
				class:btn-accent={themeColor === 'accent'}
				class:btn-secondary={themeColor === 'secondary'}
				class:btn-primary={themeColor === 'primary'}
				aria-label="Send command"
			>
				<i class="fas fa-arrow-up text-primary-content"></i>
			</button>
		</form>
	</div>

	<div class="home-indicator"></div>
</div>
