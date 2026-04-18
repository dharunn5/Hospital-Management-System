import { useEffect, useState, useRef } from "react";
import API from "../api";
import { assets } from "../assets/assets";

const defaultProfile = {
  name: "",
  image: assets.profile_pic,
  email: "",
  phone: "",
  address: { line1: "", line2: "" },
  gender: "Male",
  dob: "",
};
const MyProfile = () => {
  const [userData, setUserData] = useState(defaultProfile);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState("");
  const [message, setMessage] = useState("");
  const fileInputRef = useRef();

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token');
        const res = await API.get('/profile', { headers: { Authorization: `Bearer ${token}` } });
        setUserData({
          ...defaultProfile,
          ...res.data,
          address: res.data.address || { line1: '', line2: '' },
          image: res.data.image ? (res.data.image.startsWith('/uploads') ? `http://localhost:5000${res.data.image}` : res.data.image) : assets.profile_pic,
        });
      } catch {
        setMessage('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Handle image preview
  useEffect(() => {
    if (imgFile) {
      const reader = new FileReader();
      reader.onload = e => setImgPreview(e.target.result);
      reader.readAsDataURL(imgFile);
    } else {
      setImgPreview("");
    }
  }, [imgFile]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) setImgFile(file);
  };

  const handleSave = async () => {
    try {
      setMessage("");
      const token = localStorage.getItem('token');
      // Upload image if changed
      let imageUrl = userData.image;
      if (imgFile) {
        const formData = new FormData();
        formData.append('image', imgFile);
        const res = await API.post('/profile/image', formData, {
          headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        });
        imageUrl = `http://localhost:5000${res.data.image}`;
      }
      // Save profile
      const updateData = { ...userData, image: undefined };
      const res = await API.put('/profile', { ...updateData, image: undefined }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUserData(u => ({ ...u, ...res.data.user, image: imageUrl }));
      setIsEdit(false);
      setImgFile(null);
      setMessage('Profile updated!');
      // Notify Navbar/profile pic to update
      window.dispatchEvent(new Event('profile-updated'));
    } catch (err) {
      console.error(err);
      setMessage('Failed to update profile');
      window.dispatchEvent(new Event('profile-updated'));
    }
  };

  if (loading) return <div className="text-center py-10">Loading profile...</div>;

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 mt-8 flex flex-col items-center">
      <div className="relative mb-6">
        <img className="w-32 h-32 rounded-full object-cover border-4 border-primary" src={imgPreview || userData.image} alt="profile" />
        {isEdit && (
          <button
            className="absolute bottom-2 right-2 bg-primary text-white px-2 py-1 rounded-full text-xs shadow hover:bg-blue-700"
            onClick={() => fileInputRef.current.click()}
          >
            Change
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleImageChange}
        />
      </div>
      {message && <div className="mb-4 text-green-600 font-semibold">{message}</div>}
      <div className="w-full flex flex-col gap-4">
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="w-28 font-semibold">Name:</label>
          {isEdit ? (
            <input className="bg-gray-100 rounded px-2 py-1 flex-1" type="text" value={userData.name} onChange={e => setUserData(u => ({ ...u, name: e.target.value }))} />
          ) : (
            <span className="text-lg">{userData.name}</span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="w-28 font-semibold">Email:</label>
          <input className="bg-gray-100 rounded px-2 py-1 flex-1 text-blue-500" type="email" value={userData.email} disabled />
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="w-28 font-semibold">Phone:</label>
          {isEdit ? (
            <input className="bg-gray-100 rounded px-2 py-1 flex-1" type="text" value={userData.phone} onChange={e => setUserData(u => ({ ...u, phone: e.target.value }))} />
          ) : (
            <span>{userData.phone}</span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="w-28 font-semibold">Address:</label>
          {isEdit ? (
            <>
              <input className="bg-gray-100 rounded px-2 py-1 mb-1 flex-1" type="text" value={userData.address.line1} onChange={e => setUserData(u => ({ ...u, address: { ...u.address, line1: e.target.value } }))} placeholder="Line 1" />
              <input className="bg-gray-100 rounded px-2 py-1 flex-1" type="text" value={userData.address.line2} onChange={e => setUserData(u => ({ ...u, address: { ...u.address, line2: e.target.value } }))} placeholder="Line 2" />
            </>
          ) : (
            <span>{userData.address.line1}<br />{userData.address.line2}</span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="w-28 font-semibold">Gender:</label>
          {isEdit ? (
            <select className="bg-gray-100 rounded px-2 py-1 flex-1" value={userData.gender} onChange={e => setUserData(u => ({ ...u, gender: e.target.value }))}>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          ) : (
            <span>{userData.gender}</span>
          )}
        </div>
        <div className="flex flex-col md:flex-row md:items-center gap-2">
          <label className="w-28 font-semibold">Birthday:</label>
          {isEdit ? (
            <input className="bg-gray-100 rounded px-2 py-1 flex-1" type="date" value={userData.dob} onChange={e => setUserData(u => ({ ...u, dob: e.target.value }))} />
          ) : (
            <span>{userData.dob}</span>
          )}
        </div>
      </div>
      <div className="flex gap-4 mt-8">
        {isEdit ? (
          <>
            <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700" onClick={handleSave} type="button">Save</button>
            <button className="bg-gray-200 text-gray-700 px-6 py-2 rounded-full font-semibold hover:bg-gray-300" onClick={() => { setIsEdit(false); setImgFile(null); setMessage(""); window.dispatchEvent(new Event('profile-updated')); }}>Cancel</button>
          </>
        ) : (
          <button className="bg-primary text-white px-6 py-2 rounded-full font-semibold hover:bg-blue-700" onClick={() => setIsEdit(true)} type="button">Edit</button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
