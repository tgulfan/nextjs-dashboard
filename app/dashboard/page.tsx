import Link from 'next/link';

const Page = () => {
  return (
    <>
      <p>Dashboard page</p>
      <Link href="/dashboard/customers">Customers</Link>
    </>
  );
};

export default Page;
