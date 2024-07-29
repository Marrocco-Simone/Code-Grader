<script>
  export let code;
  export let isWrong = false;
  export let isRight = false;

  let isOpen = true;
  function switchIsOpen() {
    isOpen = !isOpen;
  }
</script>

<div
  class={`border p-4 font-mono rounded relative ${isWrong ? "bg-red-200" : ""} ${isRight ? "bg-green-200" : ""}`}
>
  <button class="absolute top-0 right-0 px-3 text-3xl" on:click={switchIsOpen}>
    {isOpen ? "▲" : "▼"}
  </button>
  {#if isOpen}
    {#each code.split("\n") as line}
      {line}<br />
    {/each}
  {/if}
</div>
