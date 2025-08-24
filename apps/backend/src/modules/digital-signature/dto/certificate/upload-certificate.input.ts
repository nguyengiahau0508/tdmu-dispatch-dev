import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional } from 'class-validator';

@InputType()
export class UploadCertificateInput {
  @Field(() => String, { description: 'Dữ liệu chứng thư số' })
  @IsString()
  certificateData: string;

  @Field(() => String, { description: 'Mật khẩu chứng thư số (nếu có)', nullable: true })
  @IsOptional()
  @IsString()
  password?: string;
}
