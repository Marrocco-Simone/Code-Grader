<script>
  import { userUuid, getProfile } from "../stores/stores.js";
  import { onMount } from "svelte";
  import Submission from "./Submission.svelte";
  import CodeEditor from "./CodeEditor.svelte";
  import Swal from "sweetalert2";

  let currentAssignment = 1;
  let isResolved = false;
  let noMoreAssignments = false;

  let assignment = {
    handout: "",
    title: "",
  };

  let submissions = [];

  async function getAssigment() {
    try {
      const response = await fetch(`/api/assignments/${currentAssignment}`);
      const { handout, title, error } = await response.json();
      if (error) {
        noMoreAssignments = true;
        assignment.handout = "";
        assignment.title = "";
      } else {
        assignment.handout = handout;
        assignment.title = title;
      }
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Something went wrong!", "error");
    }
  }

  async function getSubmissions() {
    try {
      const response = await fetch(
        `/api/grades/${$userUuid}/${currentAssignment}`
      );
      submissions = await response.json();
      submissions.sort((a, b) => b.last_updated.localeCompare(a.last_updated));
      isResolved = submissions.some(
        (submission) => submission.status === "processed" && submission.correct
      );
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Something went wrong!", "error");
    }
  }

  function getUpdatedProfile() {
    getProfile().then((p) => {
      currentAssignment = p.currentAssignment ?? 1;
      getAssigment();
      getSubmissions();
    });
  }

  onMount(() => {
    getUpdatedProfile();
  });

  function resetSubmissions() {
    Swal.fire({
      title: "Careful!",
      text: "You are about to delete all your submissions! You will need to solve all exercises again.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then((result) => {
      if (result.isConfirmed) {
        fetch(`/api/submissions/${$userUuid}/reset`, {
          method: "DELETE",
        }).then(() => {
          Swal.fire("Resetted!", `Your profile have been resetted`, "success");
          noMoreAssignments = false;
          getUpdatedProfile();
        });
      }
    });
  }
</script>

{#if noMoreAssignments}
  <h1 class="text-4xl font-bold">No more assignments - Congratulations!</h1>
  <button
    class="bg-red-500 hover:bg-red-700 text-white font-bold p-4 rounded m-4"
    on:click={resetSubmissions}>Reset your profile</button
  >
{:else}
  <h1 class="text-4xl font-bold">{assignment.title}</h1>
  <p>{assignment.handout}</p>
  <CodeEditor {getSubmissions} {currentAssignment} />
{/if}

{#if isResolved}
  <button
    class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-4"
    on:click={getUpdatedProfile}>Go to next assignment</button
  >
{/if}

{#if submissions.length > 0}
  <h2 class="text-2xl font-bold">Your submissions</h2>
  <div>
    {#each submissions as submission}
      <Submission {submission} {getSubmissions} />
    {/each}
  </div>
{/if}
