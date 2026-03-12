import { Body, Container, Head, Heading, Hr, Html, Img, Link, Preview, Section, Text } from "@react-email/components";

interface OrganizationCreatedEmailProps {
  organizationName?: string;
  organizationId?: string;
}

const baseUrl = process.env.NEXT_PUBLIC_BASE_URL
  ? `https://${process.env.NEXT_PUBLIC_BASE_URL}`
  : "http://localhost:3000";

export default function OrganizationCreatedEmail({ organizationName, organizationId }: OrganizationCreatedEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={main}>
        <Preview>Your organization is ready</Preview>
        <Container style={container}>
          <Section style={coverSection}>
            <Section style={imageSection}>
              <Img src={`${baseUrl}/images/logo.png`} height="45" alt="Helsa Logo" />
            </Section>
            <Section style={upperSection}>
              <Heading style={h1}>Organization created successfully</Heading>
              <Text style={mainText}>
                {organizationName
                  ? `Your organization ${organizationName} is now active in Helsa.`
                  : "Your organization is now active in Helsa."}
              </Text>
              <Text style={text}>You can invite members, configure roles and start managing your workflows.</Text>
              <Section style={infoSection}>
                <Text style={infoText}>Organization ID: {organizationId || "N/A"}</Text>
              </Section>
              <Section style={actionsSection}>
                <Link href={baseUrl} target="_blank" style={primaryLink}>
                  Open Helsa
                </Link>
              </Section>
            </Section>
            <Hr />
            <Section style={lowerSection}>
              <Text style={cautionText}>Need help? Contact support@helsa.com and our team will assist you.</Text>
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

OrganizationCreatedEmail.PreviewProps = {
  organizationName: "Acme Clinic",
  organizationId: "org_12345",
} satisfies OrganizationCreatedEmailProps;

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

const infoSection = {
  margin: "8px 0",
};

const infoText = {
  ...text,
  margin: "0",
  fontWeight: "600",
};

