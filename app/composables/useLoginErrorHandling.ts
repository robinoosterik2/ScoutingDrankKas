import { useI18n } from "vue-i18n";

// interface LoginError {
//   statusMessage?: string;
//   data?: {
//     statusMessage?: string;
//   };
// }

export interface LoginErrorHandler {
  handleLoginError: (error: unknown) => {
    usernameError: string;
    passwordError: string;
    generalError: string;
  };
}

export function useLoginErrorHandling(): LoginErrorHandler {
  const { t } = useI18n();

  const handleLoginError = (error: unknown) => {
    const result = {
      usernameError: "",
      passwordError: "",
      generalError: "",
    };

    console.error("Login error:", error);

    let statusMessage: string | undefined;

    if (error && typeof error === "object") {
      const errorObj = error as Record<string, unknown>;
      statusMessage = errorObj.statusMessage as string;
      if (
        !statusMessage &&
        errorObj.data &&
        typeof errorObj.data === "object"
      ) {
        const dataObj = errorObj.data as Record<string, unknown>;
        statusMessage = dataObj.statusMessage as string;
      }
    }

    if (statusMessage === "User not found") {
      console.log("User not found");
      result.usernameError = t("login.errors.userNotFound");
    } else if (statusMessage === "Invalid credentials") {
      result.passwordError = t("login.errors.invalidCredentials");
    } else if (statusMessage === "account_activation_required") {
      result.generalError =
        "Account requires activation. Please check your email or contact support.";
    } else {
      result.generalError =
        t("login.errors.generic") ||
        "An error occurred during login. Please try again.";
    }

    return result;
  };

  return {
    handleLoginError,
  };
}
