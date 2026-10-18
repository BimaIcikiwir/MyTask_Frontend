import React from 'react';

const user = {
  name: "Dimas Aditya",
  initials: "DA",
};

const today = new Date().toLocaleDateString("id-ID", {
  weekday: "long",
  day: "numeric",
  month: "long",
  year: "numeric",
});


function Header() {
    return (
      <header className="flex items-center justify-between border-b border-stone-200 bg-slate-100 px-8 py-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Selamat datang, {user.name}
          </h1>
          <p className="mt-1 text-sm text-slate-500">{today}</p>
        </div>

        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-slate-900 text-sm font-semibold text-white">
          {user.initials}
        </div>
      </header>
    );
}

export default Header;