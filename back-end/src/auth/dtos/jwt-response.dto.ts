export class JwtResponseDto {
  access_token: string;
  token_type: 'bearer';
  refresh_token: string;
  expires_in: number;
}
