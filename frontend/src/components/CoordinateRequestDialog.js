import Swal from "sweetalert2";
import { useUserStore } from "@/stores";
import i18n from "@/i18n";
const { t } = i18n.global;

export function requestCoordinate() {
  const apiUrl = import.meta.env.VITE_API_URL;
  // Lets pop up a swal to ask for the seed name and then send it to the backend
  Swal.fire({
    title: t("coordinate_request_dialog.text"),
    input: "text",
    inputLabel: t("coordinate_request_dialog.coordinate"),
    inputPlaceholder: t("coordinate_request_dialog.placeholder"),
    showCancelButton: true,
    confirmButtonText: t("coordinate_request_dialog.bt_request"),
    cancelButtonText: t("coordinate_request_dialog.bt_cancel"),
    showLoaderOnConfirm: true,
    inputValidator: (coordinate) => validateCoordinate(coordinate),
    preConfirm: (coordinates) => {

      const userStore = useUserStore();
      const token = userStore.getValidToken();

      if (!token) {
        throw new Error("Authentication required. Please login.");
      }

      return fetch(`${apiUrl}/coordinates/request/` + coordinates, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
        .then((response) => {
          if (!response.ok) {
            if (response.status === 401) {
              useUserStore().clearToken();
              throw new Error("Unauthorized, please login again!");
            }
          }

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
        title: t("coordinate_request_dialog.request_successful"),
        text: result.value.message,
        icon: "success",
      });
    }
  });
}

export function validateCoordinate(coordinate) {
  const coordinateValidationRegex = RegExp(
    /(^(SNDST-A|CER-A|CERS-A|OCAN-A|S-FRZ|LUSH-A|FRST-A|VOLCA|BAD-A|HTFST-A|OASIS-A|V-SNDST-C|V-CER-C|V-CERS-C|V-OCAN-C|V-SWMP-C|V-SFRZ-C|V-LUSH-C|V-FRST-C|V-VOLCA-C|V-BAD-C|V-HTFST-C|V-OASIS-C|SNDST-C|CER-C|FRST-C|SWMP-C|M-SWMP-C|M-BAD-C|M-FRZ-C|M-FLIP-C|M-RAD-C|M-CERS-C)-\d+-[^-]*-[^-]*-[^-]*)/gm
  );
  return new Promise((resolve) => {
    console.log(coordinate);
    let coordinateValid = coordinateValidationRegex.test(coordinate);
    if (!coordinateValid) {
      resolve(t("coordinate_request_dialog.invalid_syntax"));
    } else {
      resolve();
    }
  });
}
