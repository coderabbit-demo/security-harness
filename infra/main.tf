provider "aws" {
  region = "us-east-1"
}

resource "aws_s3_bucket" "customer_exports" {
  bucket = "security-harness-customer-exports"
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "customer_exports" {
  bucket = aws_s3_bucket.customer_exports.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicRead"
      Effect    = "Allow"
      Principal = "*"
      Action    = "s3:GetObject"
      Resource  = "arn:aws:s3:::security-harness-customer-exports/*"
    }]
  })
}
