/**
 * This interface is used to define the send process options.
 * i.e. if the process have to send an email or a webhook.
 */
export interface SendOptionsInterface {
    email: boolean;
    webhook: boolean;
}
