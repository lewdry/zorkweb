<!--
  Inline SVG icon component — replaces the Font Awesome CDN dependency.
  Icons are sourced from Font Awesome 6 Free (solid) — MIT / CC-BY-4.0 licensed.
  Only the 6 icons actually used in the project are included.
-->
<script>
  /** @type {'bars'|'times'|'home'|'phone'|'phone-slash'|'chevron-down'|'arrow-up'} */
  let { name, class: className = '' } = $props();
</script>

<!-- All paths taken from Font Awesome 6 Free Solid SVGs -->
{#if name === 'bars'}
  <svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M0 96C0 78.3 14.3 64 32 64l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 128C14.3 128 0 113.7 0 96zM0 256c0-17.7 14.3-32 32-32l384 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 288c-17.7 0-32-14.3-32-32zM448 416c0 17.7-14.3 32-32 32L32 448c-17.7 0-32-14.3-32-32s14.3-32 32-32l384 0c17.7 0 32 14.3 32 32z"/>
  </svg>
{:else if name === 'times'}
  <svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"/>
  </svg>
{:else if name === 'home'}
  <svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 576 512" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M575.8 255.5c0 18-15 32.1-32 32.1l-32 0 0 160c0 35.3-28.7 64-64 64l-320 0c-35.3 0-64-28.7-64-64l0-160-32 0c-18 0-32-14-32-32.1c0-9 3-17 10-24L266.4 8c7-7 15-8 22-8s15 2 21.6 7.4l.8 .8 256 224c8 7 12 15 11 24zM352 224a64 64 0 1 0 -128 0 64 64 0 1 0 128 0zm-216 96l0 64c0 8.8 7.2 16 16 16l224 0c8.8 0 16-7.2 16-16l0-64c0-8.8-7.2-16-16-16l-224 0c-8.8 0-16 7.2-16 16z"/>
  </svg>
{:else if name === 'phone'}
  <svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M164.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C12.1 30.2 0 46 0 64C0 311.4 200.6 512 448 512c18 0 33.8-12.1 38.6-29.5l24-88c5.3-19.4-4.6-39.7-23.2-47.4l-96-40c-16.3-6.8-35.2-2.1-46.3 11.6L304.7 368C234.3 334.7 177.3 277.7 144 207.3L193.3 167c13.7-11.2 18.4-30 11.6-46.3l-40-96z"/>
  </svg>
{:else if name === 'phone-slash'}
  <svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M228.9 24.6c-7.7-18.6-28-28.5-47.4-23.2l-88 24C76.1 30.2 64 46 64 64c0 48.6 9.4 95.2 26.5 137.9L38.8 244.8c-13.6 11-16 30.7-5 44.3s30.7 16 44.3 5L128 249.8l0 0 96-78.3 0 0 96-78.3 0 0 63.3-51.6c4.4-12.8 2.1-27.2-7.3-37.9L335.6 64.8c-13.6-11-33.5-8.9-44.5 4.7l-3.7 4.5L257.3 120.5c-1.6-.8-3.2-1.6-4.8-2.4L293.3 167c-13.7 11.2-18.4 30-11.6 46.3l40 96c7.7 18.6 28 28.5 47.4 23.2l-53.7 43.8c-1.4-.5-2.8-1-4.1-1.6L270.9 415.2c22.4 12.5 46.6 22.4 72.1 29.1l.4 .1c7.2 1.9 14.8 2.1 22-.3l88-24c17.4-4.7 28.9-20.5 28.6-38.6l-1-64c-.3-17.9-12.3-33.3-29.4-37.6l-96-24c-14.4-3.6-29.6 1.4-39.1 12.8l-39.6 47.5c-19.7-11.6-37.5-25.8-53.2-42.1L601.2 20.7c13.6-11 16-30.7 5-44.3s-30.7-16-44.3-5L228.9 24.6z"/>
  </svg>
{:else if name === 'chevron-down'}
  <svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M233.4 406.6c12.5 12.5 32.8 12.5 45.3 0l192-192c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L256 338.7 86.6 169.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3l192 192z"/>
  </svg>
{:else if name === 'arrow-up'}
  <svg class={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" fill="currentColor" aria-hidden="true" width="1em" height="1em">
    <path d="M214.6 41.4c-12.5-12.5-32.8-12.5-45.3 0l-160 160c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L160 141.2 160 448c0 17.7 14.3 32 32 32s32-14.3 32-32l0-306.7L329.4 246.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3l-160-160z"/>
  </svg>
{/if}

<style>
  svg {
    display: inline-block;
    vertical-align: -0.125em;
  }
</style>
