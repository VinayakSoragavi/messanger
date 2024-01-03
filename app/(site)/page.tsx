import Image from "next/image";
import AuthFrom from "./components/AuthFrom";

export default function Home() {
  return (
    <div className="flex min-h-full flex-col justify-center py-12  sm:px-12 lg:px-8 bg-gray-100">
      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Image
          alt="Logo"
          height={48}
          width={48}
          className="mx-auto m-auto"
          src="/images/messengerlogo.png"
        />
        <h2 className="mt-6 text-center text-3xl font-bold tracking-tight text-gray-900">
          Sign in to your account
        </h2>
      </div>
      <AuthFrom />
    </div>
  );
}
