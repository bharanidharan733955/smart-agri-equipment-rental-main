import { 
  Sprout, 
  Tractor, 
  PlusCircle, 
  Calendar, 
  Wrench, 
  LogOut, 
  ShieldCheck, 
  Building2,
  Menu,
  MessageSquare,
  FileText
} from 'lucide-react';

export default function CoopStaffLayout({ activeTab, setActiveTab, onLogout, onOpenAddModal, children }) {
  const navItems = [
    { id: 'inventory', label: 'Hub Inventory', icon: Tractor },
    { id: 'add-equipment', label: 'Add Equipment', icon: PlusCircle, isAction: true },
    { id: 'requests', label: 'Rental Requests', icon: Calendar },
    { id: 'farmers', label: 'Registered Farmers', icon: ShieldCheck },
    { id: 'invoices', label: 'Billing & Invoices', icon: Building2 },
    { id: 'feedback', label: 'Farmer Feedback', icon: MessageSquare },
    { id: 'reports', label: 'Billing & Reports', icon: FileText }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: '#0b1324', color: '#ffffff' }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: '#0c162c',
          borderRight: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100%'
        }}
      >
        {/* Sidebar Header Brand */}
        <div style={{ padding: '1.5rem 1.5rem 1.8rem 1.5rem', borderBottom: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '10px',
                backgroundColor: 'var(--green-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sprout size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.1 }}>
                AgriRentGov
              </div>
              <div style={{ fontSize: '0.6rem', fontWeight: 700, color: '#38bdf8', letterSpacing: '0.08em', marginTop: '1px' }}>
                COOPERATIVE STAFF HUB
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Menu Links */}
        <nav style={{ padding: '1.25rem 1rem', flexGrow: 1, display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
          {navItems.map((item) => {
            const IconComponent = item.icon;
            const isActive = activeTab === item.id;

            if (item.isAction) {
              return (
                <button
                  key={item.id}
                  onClick={onOpenAddModal}
                  style={{
                    width: '100%',
                    padding: '0.75rem 1.25rem',
                    borderRadius: '12px',
                    backgroundColor: 'rgba(16, 185, 129, 0.15)',
                    border: '1px solid rgba(16, 185, 129, 0.35)',
                    color: '#10b981',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 700,
                    fontSize: '0.92rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'rgba(16, 185, 129, 0.15)';
                  }}
                >
                  <IconComponent size={20} color="#10b981" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1.25rem',
                  borderRadius: '12px',
                  backgroundColor: isActive ? 'rgba(56, 189, 248, 0.15)' : 'transparent',
                  border: isActive ? '1px solid rgba(56, 189, 248, 0.3)' : '1px solid transparent',
                  color: isActive ? '#38bdf8' : '#94a3b8',
                  fontFamily: 'var(--font-family)',
                  fontWeight: isActive ? 700 : 500,
                  fontSize: '0.92rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.9rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.04)';
                    e.currentTarget.style.color = '#ffffff';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                    e.currentTarget.style.color = '#94a3b8';
                  }
                }}
              >
                <IconComponent size={20} color={isActive ? '#38bdf8' : '#94a3b8'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout Button */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid rgba(255, 255, 255, 0.06)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1.25rem',
              borderRadius: '12px',
              backgroundColor: 'transparent',
              border: '1px solid transparent',
              color: '#94a3b8',
              fontFamily: 'var(--font-family)',
              fontWeight: 600,
              fontSize: '0.9rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.8rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.1)';
              e.currentTarget.style.color = '#ef4444';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = '#94a3b8';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        
        {/* Top Header */}
        <header
          style={{
            height: '70px',
            backgroundColor: '#0c162c',
            borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
            padding: '0 2.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          {/* Left Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.9rem', color: '#94a3b8' }}>
            <Menu size={18} color="#94a3b8" />
            <span>AgriRentGov</span>
            <span>/</span>
            <span>Cooperative Staff</span>
            <span>/</span>
            <span style={{ color: '#ffffff', fontWeight: 600 }}>Equipment Management</span>
          </div>

          {/* Right User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'rgba(2, 132, 199, 0.15)',
                border: '1px solid rgba(56, 189, 248, 0.3)',
                color: '#38bdf8',
                fontSize: '0.78rem',
                fontWeight: 700
              }}
            >
              <ShieldCheck size={14} />
              <span>Cooperative Staff</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#ffffff', lineHeight: 1.1 }}>
                RAKESH SHARMA
              </div>
              <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building2 size={12} />
                <span>Ludhiana Hub #1</span>
              </div>
            </div>

            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'rgba(2, 132, 199, 0.2)',
                border: '1px solid rgba(56, 189, 248, 0.4)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 700,
                fontSize: '0.9rem',
                color: '#38bdf8'
              }}
            >
              RS
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flexGrow: 1, padding: '2.5rem', overflowY: 'auto' }}>
          {children}
        </main>

      </div>

    </div>
  );
}
