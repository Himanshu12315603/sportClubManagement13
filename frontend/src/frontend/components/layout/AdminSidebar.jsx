import Sidebar from './Sidebar';

/** Admin console sidebar — reuses the shared shell with the admin navigation. */
export default function AdminSidebar({ open, onClose }) {
  return <Sidebar variant="admin" open={open} onClose={onClose} />;
}
