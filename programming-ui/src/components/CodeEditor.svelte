<script>
  import Swal from "sweetalert2";
  import { userUuid, getProfile } from "../stores/stores.js";

  export let getSubmissions;
  export let currentAssignment;

  let code = `\
def hello():
  return "Hello"
  
def sum(a, b):
  return a + b`;

  function swalToast(title, text, icon) {
    Swal.fire({
      title,
      text,
      icon,
      toast: true,
      position: "bottom-start",
      timer: 4000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  }

  async function sendCode() {
    try {
      const response = await fetch(
        `/api/grades/${$userUuid}/${currentAssignment}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ code }),
        }
      );

      let { submission, error } = await response.json();
      if (error) {
        Swal.fire("Error!", error, "error");
        return;
      }
      await getSubmissions();

      if (submission.already_submitted) {
        Swal.fire(
          "Warning!",
          "You already submitted this code for this assignment! The new submission has the same result as a previous one.",
          "warning"
        );
        return;
      } else {
        swalToast("Sent!", "Code sent to grader", "success");
      }

      let maxRequests = 15;
      while (submission.status !== "processed" && maxRequests > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        const response = await fetch(
          `/api/submissions/${$userUuid}/${submission.id}`
        );
        const { submission: newSubmission, error } = await response.json();

        if (error) {
          Swal.fire(
            "Error!",
            `Something went wrong while waiting for updates of submission ${submission.id}: ${error}`,
            "error"
          );
          break;
        }
        submission = newSubmission;

        if (submission.status === "processed") {
          if (submission.correct) {
            swalToast("Correct!", "You passed the test!", "success");
          } else {
            swalToast("Incorrect!", "The test was unsuccessful!", "error");
          }
        } else {
          maxRequests--;
        }
      }

      if (maxRequests === 0 && submission.status !== "processed") {
        Swal.fire(
          "Error!",
          "The submission took too long to process. Please try again later.",
          "error"
        );
        await fetch(`/api/submissions/${$userUuid}/${submission.id}`, {
          method: "DELETE",
        });
      }

      getSubmissions();
      getProfile();
    } catch (error) {
      console.error(error);
      Swal.fire("Error!", "Something went wrong!", "error");
    }
  }
</script>

<textarea
  id="code-editor-textarea"
  bind:value={code}
  class="font-mono w-full h-64 rounded p-4 border-4 focus:outline-none focus:ring"
/>

<button
  class="bg-blue-500 hover:bg-blue-700 text-white font-bold p-4 rounded m-4"
  on:click={sendCode}
>
  Send for grading
</button>
