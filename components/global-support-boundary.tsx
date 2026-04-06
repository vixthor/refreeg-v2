"use client";

import React from "react";
import { SupportErrorCta } from "@/components/support-error-cta";

type Props = {
  children: React.ReactNode;
};

type State = {
  hasError: boolean;
  errorMessage: string | null;
};

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === "string") {
    return error;
  }

  return "An unexpected error occurred.";
}

export class GlobalSupportBoundary extends React.Component<Props, State> {
  state: State = {
    hasError: false,
    errorMessage: null,
  };

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      errorMessage: getErrorMessage(error),
    };
  }

  private handleWindowError = (event: ErrorEvent) => {
    this.setState({
      hasError: true,
      errorMessage: getErrorMessage(event.error || event.message),
    });
  };

  private handleUnhandledRejection = (event: PromiseRejectionEvent) => {
    this.setState({
      hasError: true,
      errorMessage: getErrorMessage(event.reason),
    });
  };

  componentDidCatch(error: unknown) {
    console.error(error);
  }

  componentDidMount() {
    window.addEventListener("error", this.handleWindowError);
    window.addEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );
  }

  componentWillUnmount() {
    window.removeEventListener("error", this.handleWindowError);
    window.removeEventListener(
      "unhandledrejection",
      this.handleUnhandledRejection,
    );
  }

  render() {
    if (this.state.hasError) {
      return (
        <main className="mx-auto flex min-h-[70vh] w-full max-w-3xl items-center px-4 py-12 sm:px-6">
          <SupportErrorCta
            title="We hit an error loading this page"
            description="Please follow us on X and join our Telegram community for customer support while we sort this out."
            errorMessage={this.state.errorMessage}
            onRetry={() => {
              window.location.href = "/";
            }}
            retryLabel="Go home"
          />
        </main>
      );
    }

    return this.props.children;
  }
}
