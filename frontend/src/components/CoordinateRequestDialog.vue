<script setup>
import Swal from "sweetalert2";
import { useUserStore } from "@/stores";
import { useI18n } from 'vue-i18n';

const { t } = useI18n();
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
    title: t("coordinate_request_dialog.text"),
    input: "text",
    inputLabel: t("coordinate_request_dialog.label"),
    inputPlaceholder: t("coordinate_request_dialog.placeholder"),
    showCancelButton: true,
    cancelButtonText: t("coordinate_request_dialog.cancel_button"),
    confirmButtonText: t("coordinate_request_dialog.submit_button"),
    showLoaderOnConfirm: true,
    inputValidator: (coordinate) => {
      if(!isCoordinateValid(coordinate)) {
        return t("coordinate_request_dialog.invalid_syntax")
      }
    },
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
      title: t("coordinate_request_dialog.confirm_title"),
      text: result.value.message,
      confirmButtonText: t("coordinate_request_dialog.confirm_button"),
      icon: "success",
    });
  }
}
</script>

<template>
  <button class="btn btn-sm btn-primary" @click="onButtonClick" >
    {{ $t("coordinate_request_dialog.title") }}
  </button>
</template>