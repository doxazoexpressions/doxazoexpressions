/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface RecoveryEmailProps {
  siteName: string
  confirmationUrl: string
}

export const RecoveryEmail = ({
  siteName,
  confirmationUrl,
}: RecoveryEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Reset your password for {siteName}</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Reset your password</Heading>
        <Text style={text}>
          We received a request to reset your password for {siteName}. Click
          the button below to choose a new password.
        </Text>
        <Button style={button} href={confirmationUrl}>
          Reset Password
        </Button>
        <Text style={footer}>
          If you didn't request a password reset, you can safely ignore this
          email. Your password will not be changed.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default RecoveryEmail

const main = { backgroundColor: '#ffffff', fontFamily: "'DM Sans', 'Segoe UI', sans-serif" }
const container = { padding: '28px 32px', border: '1px solid #e8e4de', borderRadius: '12px', backgroundColor: '#faf9f7' }
const h1 = {
  fontSize: '24px',
  fontWeight: 700,
  color: '#1a3352',
  fontFamily: "'Playfair Display', Georgia, serif",
  margin: '0 0 24px',
}
const text = {
  fontSize: '15px',
  color: '#4a5568',
  lineHeight: '1.7',
  margin: '0 0 24px',
}
const button = {
  backgroundColor: '#1a3352',
  color: '#f8f5f0',
  fontSize: '15px',
  fontWeight: 600,
  borderRadius: '12px',
  padding: '14px 28px',
  textDecoration: 'none',
}
const footer = { fontSize: '13px', color: '#9e9a94', margin: '32px 0 0', lineHeight: '1.6' }
