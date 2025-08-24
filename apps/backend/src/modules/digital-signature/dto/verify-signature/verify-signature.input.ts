import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber } from 'class-validator';

@InputType()
export class VerifySignatureInput {
  @Field(() => Int, { description: 'ID của chữ ký số cần xác thực' })
  @IsNotEmpty({ message: 'Signature ID không được để trống' })
  @IsNumber({}, { message: 'Signature ID phải là số' })
  signatureId: number;
}
