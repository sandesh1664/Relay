import type {Metadata} from 'next';
import './globals.css';
export const metadata:Metadata={title:'Relay — Stories don’t end. They branch.',description:'Start a scene. Take a different turn. Make something together.',icons:{icon:'/favicon.svg'}};
export default function Layout({children}:{children:React.ReactNode}){return <html lang="en"><body>{children}</body></html>}
