import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNotEmpty, IsNumber, IsString, IsOptional } from 'class-validator';

@InputType()
export class CreateSignatureInput {
  @Field(() => Int, { description: 'ID của văn bản cần ký số' })
  @IsNotEmpty({ message: 'Document ID không được để trống' })
  @IsNumber({}, { message: 'Document ID phải là số' })
  documentId: number;

  @Field(() => Int, { description: 'ID của chứng thư số sử dụng' })
  @IsNotEmpty({ message: 'Certificate ID không được để trống' })
  @IsNumber({}, { message: 'Certificate ID phải là số' })
  certificateId: number;

  @Field(() => String, { description: 'Dữ liệu chữ ký số' })
  @IsNotEmpty({ message: 'Signature data không được để trống' })
  @IsString({ message: 'Signature data phải là chuỗi' })
  signatureData: string;

  @Field(() => String, { description: 'Ghi chú khi ký số', nullable: true })
  @IsOptional()
  @IsString({ message: 'Comment phải là chuỗi' })
  comment?: string;
}
