// import { Navbar } from "@/components/ui/navbar";
// import { Footer } from "@/components/ui/footer";
// import { getSessionId } from "@/lib/helpers";
// import { getUserById } from "@/lib/firebase/actions";


export default async function Layout({ children }: { children: React.ReactNode }) {
  // const session = (await getSessionId())
  // const user = await getUserById(session ?? "")
  return (
    <div>
      {/* <Navbar userSession={!!session} profile={user?.profileImage === "" ? undefined : user?.profileImage} /> */}
      {children}
      {/* <Footer /> */}
    </div>
  );

}
