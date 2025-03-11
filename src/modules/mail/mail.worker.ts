import { Processor, WorkerHost } from "@nestjs/bullmq";
import { Job } from "bullmq";
import { MailService } from "./mail.service";

@Processor('email-verification')
export class EmailWorker extends WorkerHost {
    constructor(private readonly mailService: MailService) {
        super();
    }
    async process(job: Job, token?: string): Promise<any> {
        try {
            await this.mailService.sendUserConfirmation(job.data);
            console.log('email sent to ', job.data.email);
        } catch (error) {
            console.log(error)   
        }
    }
}