import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

interface OrganizationInvitationEmailProps {
  organizationName?: string;
  role?: string;
  invitationUrl?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : "http://localhost:3000";

export default function OrganizationInvitationEmail({
  organizationName,
  role,
  invitationUrl,
}: OrganizationInvitationEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Invitation to join Helsa organization</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img src={`${baseUrl}/images/logo.png`} height="45" alt="Helsa Logo" />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>You are invited to join{organizationName ? ` ${organizationName}` : ""}</Heading>
              <Text style={mainText}>
                You have been invited to join{organizationName ? ` ${organizationName}` : " an organization"} on Helsa
                with the role <strong>{role || "member"}</strong>.
              </Text>
              <Text style={text}>Accept your invitation to start collaborating with your team.</Text>
              <Section style={actionsSection}>
                <Link href={invitationUrl || baseUrl} target="_blank" style={primaryLink}>
                  Accept invitation
                </Link>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>
                If you were not expecting this invitation, you can safely ignore this message.
              </Text>
            </Section>
          </Section>
          <Text style={footerText}>
            &copy; 2026 Helsa Healthcare, Inc. All rights reserved. Helsa is a trademark of{" "}
            <Link href="https://helsa.com" target="_blank" style={link}>
              Helsa.com
            </Link>
            .
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

OrganizationInvitationEmail.PreviewProps = {
  organizationName: "Acme Clinic",
  role: "doctor",
  invitationUrl: "https://helsa.com/accept-invitation",
} satisfies OrganizationInvitationEmailProps;

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

const primaryLink = {
  ...link,
  display: "inline-block",
  backgroundColor: "#8167ec",
  color: "#ffffff",
  textDecoration: "none",
  padding: "10px 16px",
  borderRadius: "6px",
  fontWeight: "600",
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

const mainText = { ...text, marginBottom: "14px" };

const cautionText = { ...text, margin: "0px" };

const actionsSection = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  marginTop: "8px",
};

