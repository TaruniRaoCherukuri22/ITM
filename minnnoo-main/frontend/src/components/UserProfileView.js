import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Topbar from "./Topbar";

export default function UserProfileView() {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);


  const [isFollowing, setIsFollowing] = useState(false);
const [followersCount, setFollowersCount] = useState(0);



  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/auth/profile/${userId}`
        );
        const data = await res.json();
        setUser(data);
      } catch (err) {
        console.error("Failed to fetch user profile", err);
      }
    };
    fetchUser();
  }, [userId]);





  if (!user) return <div className="p-10">Loading...</div>;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />

      <div className={`flex-1 ${sidebarOpen ? "ml-60" : "ml-0"}`}>
        <Topbar setSidebarOpen={setSidebarOpen} />

        <div className="max-w-3xl mx-auto p-8">
          <div className="bg-white rounded-2xl border shadow-sm p-6 space-y-4">

            <h1 className="text-2xl font-bold">{user.name}</h1>

            <p className="text-sm text-gray-500">{user.designation}</p>

            <div className="text-sm">
              <strong>Email:</strong> {user.email}
            </div>

            {/* <div className="text-sm">
              <strong>Phone:</strong> {user.phone}
            </div> */}

               <p className="text-sm text-gray-500">{user.phone}</p>

            {user.skills?.length > 0 && (
              <div>
                <strong className="text-sm">Skills</strong>
                <div className="flex flex-wrap gap-2 mt-2">
                  {user.skills.map((skill) => (
                    <span
                      key={skill}
                      className="px-3 py-1 text-xs rounded-full
                                 bg-indigo-50 text-indigo-700 border"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {user.resume && (
              <a
                href={`http://localhost:5000${user.resume}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 text-sm underline"
              >
                View Resume
              </a>
            )}

          </div>
        </div>

    {/* <button onClick={handleFollow}>
  {isFollowing ? "Unfollow" : "Follow"}
</button> */}
      </div>
    </div>
  );
}