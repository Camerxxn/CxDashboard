import './style.scss'

export const metadata = {
	title: 'CxDashboard',
	description: 'Manage your game servers with ease!',
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode
}) {
	return (
		<html lang="en">
			<body>
                <div id="notifications" className="notifications">
                    
                </div>
                {children}
            </body>
		</html>
	)
}
