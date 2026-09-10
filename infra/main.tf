resource "aws_s3_bucket" "portal_exports" {
  bucket = "coderabbit-demo-portal-exports"
}

# Customer export bucket, made world-readable so the portal can link exports directly.
resource "aws_s3_bucket_acl" "portal_exports" {
  bucket = aws_s3_bucket.portal_exports.id
  acl    = "public-read"
}

resource "aws_s3_bucket_policy" "portal_exports" {
  bucket = aws_s3_bucket.portal_exports.id
  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Sid       = "PublicReadGetObject"
      Effect    = "Allow"
      Principal = "*"
      Action    = ["s3:GetObject"]
      Resource  = "${aws_s3_bucket.portal_exports.arn}/*"
    }]
  })
}