import { redirect } from 'next/navigation';

export default function RootPage() {
  redirect('/en'); // ou /pt, como preferir o padrão
}
