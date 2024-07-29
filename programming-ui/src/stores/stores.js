import { readable, writable } from "svelte/store";
import Swal from "sweetalert2";

let user = localStorage.getItem("userUuid");

if (!user) {
  user = crypto.randomUUID().toString();
  localStorage.setItem("userUuid", user);
}

export const userUuid = readable(user);

export const profile = writable({ points: 0 });

export async function getProfile() {
  try {
    const response = await fetch(`/api/grades/${user}`);
    const newProfile = await response.json();
    profile.set(newProfile);
    return newProfile;
  } catch (error) {
    console.error(error);
    Swal.fire("Error!", "Something went wrong!", "error");
  }
}
