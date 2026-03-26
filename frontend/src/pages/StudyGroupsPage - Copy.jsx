import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Users, PlusCircle, LogIn, Key, ShieldCheck, MessageSquare, Phone, X } from 'lucide-react';
import { jwtDecode } from 'jwt-decode';

const StudyGroupsPage = () => {
    const [ownedGroups, setOwnedGroups] = useState([]); 
    const [joinedGroups, setJoinedGroups] = useState([]);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [errors, setErrors] = useState({});

    const [createForm, setCreateForm] = useState({
        GroupName: '',
        Description: '',
        Subject: '',
        PhoneNumber: ''
    });

    const [joinForm, setJoinForm] = useState({
        phoneNumber: '',
        subject: '',
        joinCode: ''
    });

    const navigate = useNavigate();
    const API_URL = "http://localhost:5005/api/studygroups";
    const token = localStorage.getItem('token'); 

    // --- USER IDENTITY ---
    let userEmail = "";
    let userName = "";

    if (token) {
        try {
            const decoded = jwtDecode(token);
            userName = decoded.unique_name || "Student";
            const identity = decoded.email || decoded["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
            userEmail = identity || `${userName.toLowerCase()}@gmail.com`;
        } catch (e) {}
    }

    useEffect(() => {
        if (userEmail) fetchUserGroups();
    }, [userEmail]);

    const fetchUserGroups = async () => {
        try {
            const res = await axios.get(`${API_URL}/user/${userEmail}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            setOwnedGroups(res.data.filter(g => g.createdByEmail === userEmail));
            setJoinedGroups(res.data.filter(g => g.createdByEmail !== userEmail));
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // --- VALIDATION ---
    const validateCreateForm = () => {
        let temp = {};

        if (!createForm.GroupName.trim()) temp.GroupName = "Required";
        if (!createForm.Subject.trim()) temp.Subject = "Required";

        if (!createForm.Description.trim()) temp.Description = "Required";
        else if (createForm.Description.length > 50) temp.Description = "Max 50 characters";

        if (!/^[0-9]{10}$/.test(createForm.PhoneNumber)) temp.PhoneNumber = "Invalid phone";

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    const validateJoinForm = () => {
        let temp = {};

        if (!/^[0-9]{10}$/.test(joinForm.phoneNumber)) temp.joinPhone = "Invalid phone";
        if (!joinForm.subject.trim()) temp.joinSubject = "Required";
        if (joinForm.joinCode.length !== 6) temp.joinCode = "6 digits required";

        setErrors(temp);
        return Object.keys(temp).length === 0;
    };

    // --- CREATE ---
    const handleCreate = async (e) => {
        e.preventDefault();
        if (!validateCreateForm()) return;

        try {
            const payload = {
                ...createForm,
                CreatedByEmail: userEmail,
                Members: [{ Email: userEmail, Phone: createForm.PhoneNumber }]
            };

            await axios.post(`${API_URL}/create`, payload, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Group Created!");
            setShowCreateModal(false);
            fetchUserGroups();
        } catch {
            alert("Error creating group");
        }
    };

    // --- JOIN ---
    const handleJoin = async (e) => {
        e.preventDefault();
        if (!validateJoinForm()) return;

        try {
            const res = await axios.post(`${API_URL}/join`, {
                Email: userEmail,
                JoinCode: joinForm.joinCode,
                PhoneNumber: joinForm.phoneNumber,
                Subject: joinForm.subject
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            alert("Joined!");
            setShowJoinModal(false);
            fetchUserGroups();
            navigate(`/chat/${res.data.groupId}`);
        } catch {
            alert("Join failed");
        }
    };

    if (loading) return <div className="p-10">Loading...</div>;

    return (
        <div className="flex h-screen bg-slate-100">

            {/* SIDEBAR */}
            <div className="w-80 bg-white p-5 border-r">
                <h2 className="font-bold mb-4 flex gap-2 items-center">
                    <Users /> My Groups
                </h2>

                {ownedGroups.map(g => (
                    <div key={g.id} onClick={() => navigate(`/chat/${g.id}`)} className="p-3 border mb-2 cursor-pointer">
                        <b>{g.groupName}</b>
                        <div className="text-xs flex gap-1 items-center">
                            <Key size={12}/> {g.joinCode}
                        </div>
                    </div>
                ))}

                <hr className="my-4"/>

                {joinedGroups.map(g => (
                    <div key={g.id} onClick={() => navigate(`/chat/${g.id}`)} className="p-3 border mb-2 cursor-pointer">
                        {g.groupName}
                        <div className="text-xs flex gap-1 items-center">
                            <Phone size={12}/> {g.phoneNumber}
                        </div>
                    </div>
                ))}
            </div>

            {/* MAIN */}
            <div className="flex-1 p-10 space-x-5">
                <button onClick={() => setShowCreateModal(true)} className="bg-blue-600 text-white px-4 py-2 rounded">
                    <PlusCircle /> Create
                </button>

                <button onClick={() => setShowJoinModal(true)} className="bg-green-600 text-white px-4 py-2 rounded">
                    <LogIn /> Join
                </button>
            </div>

            {/* MODALS same as your original (kept simple here) */}
        </div>
    );
};

export default StudyGroupsPage;