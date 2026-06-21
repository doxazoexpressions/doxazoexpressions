/// <reference types="npm:@types/react@18.3.1" />

import * as React from 'npm:react@18.3.1'

import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
} from 'npm:@react-email/components@0.0.22'

interface ReauthenticationEmailProps {
  token: string
}

export const ReauthenticationEmail = ({ token }: ReauthenticationEmailProps) => (
  <Html lang="en" dir="ltr">
    <Head />
    <Preview>Your verification code</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Confirm reauthentication</Heading>
        <Text style={text}>Use the code below to confirm your identity:</Text>
        <Text style={codeStyle}>{token}</Text>
        <Text style={footer}>
          This code will expire shortly. If you didn't request this, you can
          safely ignore this email.
        </Text>
      </Container>
    </Body>
  </Html>
)

export default ReauthenticationEmail

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
const codeStyle = {
  fontFamily: "'Courier New', Courier, monospace",
  fontSize: '28px',
  fontWeight: 700,
  color: '#1a3352',
  letterSpacing: '4px',
  margin: '0 0 30px',
}
const footer = { fontSize: '13px', color: '#9e9a94', margin: '32px 0 0', lineHeight: '1.6' }
