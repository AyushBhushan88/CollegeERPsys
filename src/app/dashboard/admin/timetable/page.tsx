"use client";

import { useState, useEffect } from "react";
import api from "@/lib/api";

interface Room {
  _id: string;
  name: string;
}

interface Course {
  _id: string;
  name: string;
  code: string;
}

interface Faculty {
  _id: string;
  name: string;
}

export default function AdminTimetable() {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [selectedRoom, setSelectedRoom] = useState("");
  const [entries, setEntries] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [formData, setFormData] = useState({
    dayOfWeek: 1,
    slotIndex: 0,
    courseId: "",
    facultyId: "",
    roomId: "",
    sectionId: "A"
  });

  useEffect(() => {
    api.get("/api/tt/rooms").then(res => setRooms(res.data));
    api.get("/api/crs/catalog").then(res => setCourses(res.data));
    // api.get("/api/faculty").then(res => setFaculty(res.data)); // Mocked
  }, []);

  const loadRoomTimetable = (roomId: string) => {
    setSelectedRoom(roomId);
    api.get(`/api/tt/room/${roomId}`).then(res => setEntries(res.data));
    setFormData({ ...formData, roomId });
  };

  const handleSave = async () => {
    try {
      await api.post("/api/tt/entry", formData);
      alert("Timetable entry created");
      setShowAddModal(false);
      loadRoomTimetable(selectedRoom);
    } catch (err: any) {
      alert(err.response?.data?.error || "Error creating entry");
    }
  };

  return (
    <div className="p-6 bg-white shadow rounded-lg">
      <h1 className="text-2xl font-bold mb-6">Master Timetable Management</h1>

      <div className="flex space-x-4 mb-6">
        <div className="flex-1">
          <label className="block text-sm font-medium mb-1">Select Room</label>
          <select 
            className="w-full border p-2 rounded"
            onChange={(e) => loadRoomTimetable(e.target.value)}
          >
            <option value="">-- Select Room --</option>
            {rooms.map(r => <option key={r._id} value={r._id}>{r.name}</option>)}
          </select>
        </div>
        <button 
          onClick={() => setShowAddModal(true)}
          className="bg-indigo-600 text-white px-4 py-2 rounded self-end hover:bg-indigo-700"
        >
          Add New Entry
        </button>
      </div>

      {selectedRoom ? (
        <div className="border rounded overflow-hidden">
          {/* Simplified grid for admin */}
          <table className="w-full border-collapse">
             <thead className="bg-gray-50">
               <tr>
                 <th className="border p-2">Day / Slot</th>
                 {[0,1,2,3,4,5].map(s => <th key={s} className="border p-2 text-xs">Slot {s+1}</th>)}
               </tr>
             </thead>
             <tbody>
               {[1,2,3,4,5,6].map(d => (
                 <tr key={d}>
                   <td className="border p-2 font-bold text-xs">Day {d}</td>
                   {[0,1,2,3,4,5].map(s => {
                     const entry = entries.find((e: any) => e.dayOfWeek === d && e.slotIndex === s);
                     return (
                       <td key={s} className="border p-2 text-center text-[10px] min-h-[40px]">
                         {entry ? (
                           <div>
                             <div className="font-bold">{(entry.courseId as any).code}</div>
                             <div>{(entry.facultyId as any)?.userId || 'No Faculty'}</div>
                           </div>
                         ) : '-'}
                       </td>
                     );
                   })}
                 </tr>
               ))}
             </tbody>
          </table>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 italic">Please select a room to view the timetable.</div>
      )}

      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-6 rounded-lg max-w-md w-full shadow-xl">
            <h2 className="text-xl font-bold mb-4">Add Timetable Entry</h2>
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Day of Week (1-6)</label>
                <input type="number" min="1" max="6" className="w-full border p-2 rounded" value={formData.dayOfWeek} onChange={e => setFormData({...formData, dayOfWeek: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Slot Index (0-5)</label>
                <input type="number" min="0" max="5" className="w-full border p-2 rounded" value={formData.slotIndex} onChange={e => setFormData({...formData, slotIndex: parseInt(e.target.value)})} />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Course</label>
                <select className="w-full border p-2 rounded" onChange={e => setFormData({...formData, courseId: e.target.value})}>
                  <option value="">-- Select Course --</option>
                  {courses.map(c => <option key={c._id} value={c._id}>{c.code} - {c.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold uppercase mb-1">Section</label>
                <input type="text" className="w-full border p-2 rounded" value={formData.sectionId} onChange={e => setFormData({...formData, sectionId: e.target.value})} />
              </div>
            </div>
            <div className="mt-6 flex justify-end space-x-3">
              <button onClick={() => setShowAddModal(false)} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded">Cancel</button>
              <button onClick={handleSave} className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700">Save Entry</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
