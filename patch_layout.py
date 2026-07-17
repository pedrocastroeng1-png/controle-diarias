import re

with open('src/components/layout/Layout.tsx', 'r') as f:
    content = f.read()

new_main = """      <main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col">
        <div className="flex-1">
          <Outlet />
        </div>
        <footer className="mt-8 py-4 border-t border-gray-200 text-center text-xs text-gray-400">
          Versão {APP_VERSION}
        </footer>
      </main>"""

content = re.sub(r'<main className="flex-1 max-w-5xl w-full mx-auto p-4 sm:p-6 lg:p-8">\s*<Outlet />\s*</main>', new_main, content, flags=re.DOTALL)

with open('src/components/layout/Layout.tsx', 'w') as f:
    f.write(content)
