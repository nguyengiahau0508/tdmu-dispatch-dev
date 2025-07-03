import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import * as serviceAccount from './config/google-auth02-config.json'

@Injectable()
export class GoogleOauth2Service {
  private oAuth2Client = new google.auth.JWT({
    email: serviceAccount.client_email,
    key: serviceAccount.private_key,
    scopes: ['https://www.googleapis.com/auth/drive.file']
  });

  getAuthenticatedClient() {
    return this.oAuth2Client;
  }
}
