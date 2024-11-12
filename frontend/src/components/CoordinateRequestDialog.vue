<script setup>
import Swal from "sweetalert2";
import { useUserStore } from "@/stores";

const apiUrl = import.meta.env.VITE_API_URL;

// Check if given coordinate is of valid format (ex. {cluster}-{seed}-{game setting}-{story trait}-{scramble dlc})
function isCoordinateValid(coordinate) {
  return RegExp(
    /(^(SNDST-A|CER-A|CERS-A|OCAN-A|S-FRZ|LUSH-A|FRST-A|VOLCA|BAD-A|HTFST-A|OASIS-A|V-SNDST-C|V-CER-C|V-CERS-C|V-OCAN-C|V-SWMP-C|V-SFRZ-C|V-LUSH-C|V-FRST-C|V-VOLCA-C|V-BAD-C|V-HTFST-C|V-OASIS-C|SNDST-C|CER-C|FRST-C|SWMP-C|M-SWMP-C|M-BAD-C|M-FRZ-C|M-FLIP-C|M-RAD-C)-\d+-[^-]*-[^-]*-[^-]*)/gm
  ).test(coordinate)
}

async function onButtonClick() {
  // Lets pop up a swal to ask for the seed name and then send it to the backend
  let result = await Swal.fire({
    title: "Request a seed thats not found in the database yet",
    input: "text",
    inputLabel: "Coordinate:",
    inputPlaceholder: "Enter the Coordinate here...",
    showCancelButton: true,
    confirmButtonText: "Request",
    showLoaderOnConfirm: true,
    inputValidator: (coordinate) => isCoordinateValid(coordinate),
    allowOutsideClick: () => !Swal.isLoading(),
    preConfirm: async (coordinates) => {
      try {
        const response = await fetch(`${apiUrl}/coordinates/request/` + coordinates, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${useUserStore().token}`,
          },
        })
        
        const data = response.json()
        if (data.error) {
          throw new Error(data.error);
        }

        return data
      } catch(error) {
        Swal.showValidationMessage(`${error}`);
      }
    },
  })

  if (result.isConfirmed) {
    Swal.fire({
      title: "Seed Requested",
      text: result.value.message,
      icon: "success",
    });
  }
}
</script>

<template>
  <button @click="onButtonClick" >
    {{ $t("coordinate_request_dialog.request_coordinate_title") }}
  </button>
</template>