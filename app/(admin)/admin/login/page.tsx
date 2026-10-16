import type { Metadata } from "next";
import { LoginForm } from "@/components/admin/LoginForm";
import styles from "@/components/admin/Admin.module.css";

export const metadata: Metadata = {
  title: { absolute: "Admin login, WebTech Ninjas" },
  robots: { index: false, follow: false },
};

export default function AdminLoginPage() {
  return (
    <section className={styles.loginPage}>
      <div className={styles.loginCard}>
        <h1 className={styles.loginTitle}>Admin</h1>
        <LoginForm />
      </div>
    </section>
  );
}
