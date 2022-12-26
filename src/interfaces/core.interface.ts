/**
 * This interface is used to define the core process options.
 * I.e. if the process should send emails or webhooks.
 */
export interface CoreProcessInterface {
    email: boolean;
    webhook: boolean;
}
