
export default function Card({ title, children }) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h4 className="font-semibold mb-2">{title}</h4>
      <p className="text-sm text-gray-600">{children}</p>
    </div>
  );
}
 