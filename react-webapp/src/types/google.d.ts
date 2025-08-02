export {};

declare global {
  namespace google {
    namespace accounts.id {
      interface CredentialResponse {
        credential: string;
        select_by: string;
        clientId?: string;
      }

      function initialize(options: {
        client_id: string;
        callback: (response: CredentialResponse) => void;
      }): void;

      function renderButton(
        parent: HTMLElement,
        options: {
          theme: 'outline' | 'filled_blue' | 'filled_black';
          size: 'large' | 'medium' | 'small';
          type?: 'standard' | 'icon';
          shape?: 'rectangular' | 'pill' | 'circle' | 'square';
        }
      ): void;

      function prompt(): void;
    }
  }

  interface Window {
    google: typeof google;
  }
}
