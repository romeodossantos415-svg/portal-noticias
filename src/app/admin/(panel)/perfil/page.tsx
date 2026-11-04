import { requireUser } from "@/lib/auth";
import { PageHeader } from "@/components/admin/ui";
import { ProfileForm } from "@/components/admin/ProfileForm";

export default async function ProfilePage() {
  const me = await requireUser();
  return (
    <div>
      <PageHeader title="Meu perfil" />
      <ProfileForm user={me} />
    </div>
  );
}
