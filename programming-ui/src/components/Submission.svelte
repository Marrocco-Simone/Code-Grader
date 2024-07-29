<script>
  import CodeBlock from "./CodeBlock.svelte";
  import { userUuid, getProfile } from "../stores/stores.js";
  import Swal from "sweetalert2";

  export let submission;
  export let getSubmissions;

  function deleteSubmission() {
    const sendRequestToDelete = () => {
      fetch(`/api/submissions/${$userUuid}/${submission.id}`, {
        method: "DELETE",
      }).then(() => {
        Swal.fire(
          "Deleted!",
          `Submission ${submission.id} has been deleted.`,
          "success"
        );
        getSubmissions();
        getProfile();
      });
    };

    if (submission.correct) {
      Swal.fire({
        title: "Careful!",
        text: "You are about to delete a correct submission! You will need to solve this exercise again.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!",
      }).then((result) => {
        if (result.isConfirmed) {
          sendRequestToDelete();
        }
      });
    } else {
      sendRequestToDelete();
    }
  }
</script>

<div class="border p-4">
  <div class="flex justify-between align-center w-full">
    <div class="">
      <p>Id: {submission.id}</p>
      <p>Status: {submission.status}</p>
      <p>Last updated: {submission.last_updated}</p>
      {#if submission.status === "processed"}
        <p>Result: {submission.correct ? "Success" : "Fail"}</p>
      {/if}
    </div>
    <button
      class="bg-red-500 hover:bg-red-700 text-white font-bold p-4 rounded m-4"
      on:click={deleteSubmission}>Delete</button
    >
  </div>

  {#if submission.status === "processed"}
    <p>Feedback:</p>
    <CodeBlock
      code={submission.grader_feedback}
      isWrong={submission.correct === false}
      isRight={submission.correct === true}
    />

    <p>Code:</p>
    <CodeBlock code={submission.code} />
  {/if}
</div>
