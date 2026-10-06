import { 
  Sprout, 
  Tractor, 
  PlusCircle, 
  Calendar, 
  Wrench, 
  LogOut, 
  ShieldCheck, 
  UserCheck,
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
    { id: 'verifications', label: 'Farmer Verification', icon: UserCheck },
    { id: 'invoices', label: 'Billing & Invoices', icon: Building2 },
    { id: 'feedback', label: 'Farmer Feedback', icon: MessageSquare },
    { id: 'reports', label: 'Billing & Reports', icon: FileText }
  ];

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', backgroundColor: 'var(--color-background)', color: 'var(--color-text)' }}>
      
      {/* Sidebar */}
      <aside
        style={{
          width: '270px',
          backgroundColor: 'var(--color-surface)',
          borderRight: '1px solid var(--color-border)',
          display: 'flex',
          flexDirection: 'column',
          flexShrink: 0,
          height: '100%',
          boxShadow: 'var(--shadow-sm)'
        }}
      >
        {/* Sidebar Header Brand */}
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--color-border)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-primary)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sprout size={22} color="#ffffff" strokeWidth={2.5} />
            </div>
            <div>
              <div style={{ fontSize: '1.15rem', fontWeight: 800, color: 'var(--color-secondary)', lineHeight: 1.1 }}>
                AGRI RENT GOV
              </div>
              <div style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--color-muted)', letterSpacing: '0.05em', marginTop: '2px' }}>
                COOPERATIVE STAFF
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
                    padding: '0.75rem 1rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-primary)',
                    border: 'none',
                    color: 'var(--color-text)',
                    fontFamily: 'var(--font-family)',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                    textAlign: 'left',
                    marginTop: '0.5rem',
                    marginBottom: '0.5rem'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary-hover)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'var(--color-primary)';
                  }}
                >
                  <IconComponent size={18} color="#ffffff" />
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
                  padding: '0.75rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: isActive ? 'rgba(21, 128, 61, 0.08)' : 'transparent',
                  border: 'none',
                  color: isActive ? 'var(--color-primary)' : 'var(--color-text)',
                  fontFamily: 'var(--font-family)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.875rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.75rem',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  textAlign: 'left'
                }}
                onMouseEnter={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'var(--color-background)';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isActive) {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }
                }}
              >
                <IconComponent size={18} color={isActive ? 'var(--color-primary)' : 'var(--color-muted)'} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Bottom Logout Button */}
        <div style={{ padding: '1.25rem 1rem', borderTop: '1px solid var(--color-border)' }}>
          <button
            onClick={onLogout}
            style={{
              width: '100%',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'transparent',
              border: 'none',
              color: 'var(--color-muted)',
              fontFamily: 'var(--font-family)',
              fontWeight: 500,
              fontSize: '0.875rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              cursor: 'pointer',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.backgroundColor = 'var(--color-danger-bg)';
              e.currentTarget.style.color = 'var(--color-danger)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = 'transparent';
              e.currentTarget.style.color = 'var(--color-muted)';
            }}
          >
            <LogOut size={18} />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', minWidth: 0, backgroundColor: 'var(--color-background)' }}>
        
        {/* Top Header */}
        <header
          style={{
            height: '64px',
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            padding: '0 2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexShrink: 0
          }}
        >
          {/* Left Breadcrumb */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.875rem', color: 'var(--color-muted)' }}>
            <Menu size={18} color="var(--color-muted)" />
            <span>AgriRentGov</span>
            <span>/</span>
            <span>Cooperative Staff</span>
            <span>/</span>
            <span style={{ color: 'var(--color-secondary)', fontWeight: 600 }}>Dashboard</span>
          </div>

          {/* Right User Badge */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.25rem 0.75rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-info-bg)',
                color: 'var(--color-info)',
                fontSize: '0.75rem',
                fontWeight: 600
              }}
            >
              <ShieldCheck size={14} />
              <span>Cooperative Staff</span>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-secondary)', lineHeight: 1.1 }}>
                RAKESH SHARMA
              </div>
              <div style={{ fontSize: '0.75rem', color: 'var(--color-muted)', marginTop: '2px', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
                <Building2 size={12} />
                <span>Ludhiana Hub #1</span>
              </div>
            </div>

            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                backgroundColor: 'var(--color-background)',
                border: '1px solid var(--color-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 600,
                fontSize: '0.875rem',
                color: 'var(--color-secondary)'
              }}
            >
              RS
            </div>
          </div>
        </header>

        {/* Content Body */}
        <main style={{ flexGrow: 1, padding: '2rem', overflowY: 'auto' }}>
          <div className="page-container" style={{ padding: 0 }}>
            {children}
          </div>
        </main>

      </div>

    </div>
  );
}
