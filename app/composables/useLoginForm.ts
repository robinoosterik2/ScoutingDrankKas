import { ref, type Ref } from "vue";

export interface LoginFormData {
  username: string;
  password: string;
  rememberMe: boolean;
}

export interface LoginFormErrors {
  username: string;
  password: string;
  general: string;
}

export interface LoginFormState {
  data: Ref<LoginFormData>;
  errors: Ref<LoginFormErrors>;
  isLoading: Ref<boolean>;
  resetSuccess: Ref<boolean>;
  clearErrors: () => void;
  clearUsernameError: () => void;
  clearPasswordError: () => void;
  setGeneralError: (message: string) => void;
  setUsernameError: (message: string) => void;
  setPasswordError: (message: string) => void;
  setLoading: (loading: boolean) => void;
  setResetSuccess: (success: boolean) => void;
  reset: () => void;
}

export function useLoginForm(): LoginFormState {
  const data = ref<LoginFormData>({
    username: "",
    password: "",
    rememberMe: false,
  });

  const errors = ref<LoginFormErrors>({
    username: "",
    password: "",
    general: "",
  });

  const isLoading = ref(false);
  const resetSuccess = ref(false);

  const clearErrors = () => {
    errors.value = {
      username: "",
      password: "",
      general: "",
    };
  };

  const clearUsernameError = () => {
    errors.value.username = "";
  };

  const clearPasswordError = () => {
    errors.value.password = "";
  };

  const setGeneralError = (message: string) => {
    errors.value.general = message;
  };

  const setUsernameError = (message: string) => {
    errors.value.username = message;
  };

  const setPasswordError = (message: string) => {
    errors.value.password = message;
  };

  const setLoading = (loading: boolean) => {
    isLoading.value = loading;
  };

  const setResetSuccess = (success: boolean) => {
    resetSuccess.value = success;
  };

  const reset = () => {
    data.value = {
      username: "",
      password: "",
      rememberMe: false,
    };
    clearErrors();
    isLoading.value = false;
  };

  return {
    data,
    errors,
    isLoading,
    resetSuccess,
    clearErrors,
    clearUsernameError,
    clearPasswordError,
    setGeneralError,
    setUsernameError,
    setPasswordError,
    setLoading,
    setResetSuccess,
    reset,
  };
}
