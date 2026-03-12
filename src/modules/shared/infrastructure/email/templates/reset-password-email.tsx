import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

interface PasswordResetEmailProps {
  resetPasswordUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : "http://localhost:3000";

export default function PasswordResetEmail({ resetPasswordUrl }: PasswordResetEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Helsa Password Reset</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img src={`${baseUrl}/images/logo.png`} height="45" alt="Helsa Logo" />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Reset your password</Heading>
              <Text style={mainText}>
                Click the button below to reset your password. This link is valid for 10 minutes.
              </Text>
              <Section style={verificationSection}>
                <Link href={resetPasswordUrl} target="_blank" style={resetButton}>
                  Reset password
                </Link>
              </Section>
              <Text style={validityText}>If the button does not work, copy and paste this URL into your browser.</Text>
              <Text style={urlText}>{resetPasswordUrl}</Text>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>If you did not request this password reset, please ignore this email.</Text>
            </Section>
          </Section>
          <Text style={footerText}>
            &copy; 2024 Helsa Healthcare, Inc. All rights reserved. Helsa is a trademark of{" "}
            <Link href="https://helsa.com" target="_blank" style={link}>
              Helsa.com
            </Link>
            , Inc. View our{" "}
            <Link href="https://helsa.com" target="_blank" style={link}>
              privacy policy
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

PasswordResetEmail.PreviewProps = {
  resetPasswordUrl: "https://helsa.com/reset-password?token=example-token",
} satisfies PasswordResetEmailProps;

const main = {
  backgroundColor: "#fff",
  color: "#212121",
};

const container = {
  padding: "20px",
  margin: "0 auto",
  backgroundColor: "#eee",
};

const h1 = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "20px",
  fontWeight: "bold",
  marginBottom: "15px",
};

const link = {
  color: "#2754C5",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  textDecoration: "underline",
};

const text = {
  color: "#333",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  margin: "24px 0",
};

const imageSection = {
  backgroundColor: "#8167ec",
  display: "flex",
  padding: "20px 0",
  alignItems: "center",
  justifyContent: "center",
};

const coverSection = { backgroundColor: "#fff" };

const upperSection = { padding: "25px 35px" };

const lowerSection = { padding: "25px 35px" };

const footerText = {
  ...text,
  fontSize: "12px",
  padding: "0 20px",
};

const validityText = {
  ...text,
  margin: "16px 0 8px",
  textAlign: "center" as const,
};

const urlText = {
  ...text,
  margin: "0px",
  textAlign: "center" as const,
  color: "#2754C5",
  wordBreak: "break-all" as const,
};

const verificationSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "6px",
};

const resetButton = {
  backgroundColor: "#8167ec",
  borderRadius: "8px",
  color: "#ffffff",
  display: "inline-block",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue', sans-serif",
  fontSize: "14px",
  fontWeight: "bold",
  lineHeight: "100%",
  padding: "12px 22px",
  textDecoration: "none",
};

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };

