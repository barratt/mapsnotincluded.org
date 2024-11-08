import Swal from "sweetalert2";
import { useUserStore } from "@/stores";

export function requestCoordinate() {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Lets pop up a swal to ask for the seed name and then send it to the backend
  Swal.fire({
    title: "Request a seed thats not found in the database yet",
    input: "text",
    inputLabel: "Coordinate:",
    inputPlaceholder: "Enter the Coordinate here...",
    showCancelButton: true,
    confirmButtonText: "Request",
    showLoaderOnConfirm: true,
    inputValidator: (coordinate) => validateCoordinate(coordinate),
    preConfirm: (coordinates) => {
      return fetch(`${apiUrl}/coordinates/request/` + coordinates, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${useUserStore().token}`,
        },
      })
        .then((response) => {
          return response.json();
        })
        .then((data) => {
          if (data.error) {
            throw new Error(data.error);
          }
          return data;
        })

        .catch((error) => {
          Swal.showValidationMessage(`${error}`);
        });
    },
    allowOutsideClick: () => !Swal.isLoading(),
  }).then((result) => {
    if (result.isConfirmed) {
      Swal.fire({
        title: "Seed Requested",
        text: result.value.message,
        icon: "success",
      });
    }
  });
}

export function validateCoordinate(coordinate) {
  const coordinateValidationRegex = RegExp(
    /(^(SNDST-A|CER-A|CERS-A|OCAN-A|S-FRZ|LUSH-A|FRST-A|VOLCA|BAD-A|HTFST-A|OASIS-A|V-SNDST-C|V-CER-C|V-CERS-C|V-OCAN-C|V-SWMP-C|V-SFRZ-C|V-LUSH-C|V-FRST-C|V-VOLCA-C|V-BAD-C|V-HTFST-C|V-OASIS-C|SNDST-C|CER-C|FRST-C|SWMP-C|M-SWMP-C|M-BAD-C|M-FRZ-C|M-FLIP-C|M-RAD-C)-\d+-[^-]*-[^-]*-[^-]*)/gm
  );
  return new Promise((resolve) => {
    console.log(coordinate);
    let coordinateValid = coordinateValidationRegex.test(coordinate);
    if (!coordinateValid) {
      resolve("Not a valid Coordinate!");
    } else {
      resolve();
    }
  });
}
