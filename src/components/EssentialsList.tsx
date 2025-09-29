import React, { useEffect, useState } from 'react';
import { Button } from '@progress/kendo-react-buttons';
import { Card } from '@progress/kendo-react-layout';
import { Dialog } from '@progress/kendo-react-dialogs';
import { Input, RadioButton } from '@progress/kendo-react-inputs';
import { plusIcon, trashIcon, pencilIcon } from '@progress/kendo-svg-icons';
import { supabase } from '../supabaseclient';
import type { TaskItem, ItemCategory } from '../common-types';

interface Props {
    manageTasks: boolean;
    currentUser: string | null;
}

const EssentialsList = ({ manageTasks, currentUser }: Props) => {
    const [tasks, setTasks] = useState<TaskItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [newTaskText, setNewTaskText] = useState('');
    const [taskSelected, setTaskSelected] = useState(false);
    const [selectedTaskId, setSelectedTaskId] = useState<number | null>(null);
    const [selectedCategory, setSelectedCategory] = useState<ItemCategory | null>(null);

    useEffect(() => {
        fetchTasks();
    }, []);

    const fetchTasks = async () => {
        let { data, error } = await supabase.from('dailyessentials').select('*').eq('user_id', currentUser);
        if (error) {
            console.error('Error fetching tasks:', error);
        } else {
            setTasks(data || []);
        }
    };

    const handleAdd = async () => {
        try {
            const newItem = {
                user_id: currentUser,
                task: newTaskText,
                isCompleted: false,
                type: 'daily'
            };

            const { data, error } = await supabase.from('dailyessentials').insert([newItem]).select().single();

            if (error) {
                console.error('Error adding task:', error);
                return;
            }

            if (data) {
                setTasks([...tasks, data]);
                setNewTaskText('');
            }
        } catch (err) {
            console.error('Error adding task:', err);
        }
    };

    const handleDelete = async (id: number) => {
        try {
            const { error } = await supabase.from('dailyessentials').delete().eq('id', id);
            if (error) {
                console.error('Error deleting task:', error);
                return;
            }
            setTasks(tasks.filter(task => task.id !== id));
        } catch (err) {
            console.error('Error deleting task:', err);
        }
    };

    const handleEdit = (id: number) => {
        setEditingId(editingId === id ? null : id);
    };

    const handleTextChange = async (id: number, newText: string) => {
        try {
            setTasks(tasks.map(task => 
                task.id === id ? { ...task, task: newText } : task
            ));
            const { error } = await supabase.from('dailyessentials').update({ task: newText }).eq('id', id);
            if (error) {
                console.error('Error updating task:', error);
                return;
            }
        } catch (err) {
            console.error('Error updating task:', err);
        }
    };

    const toggleDialog = (id: number | null) => {
        setSelectedTaskId(id);
        setTaskSelected(!taskSelected);
    }

    const manageTask = async (category: ItemCategory) => {
        setSelectedCategory(category);
        if (selectedTaskId) {
            const { error } = await supabase.from('dailyessentials').update({ category }).eq('id', selectedTaskId);
            if (error) {
                console.error('Error updating task category:', error);
                return;
            }
            setTasks(tasks.map(task => task.id === selectedTaskId ? { ...task, category } : task));
        }
        toggleDialog(null);
    }

    const renderItems = () => {
        return tasks.map(item => (
            <Card key={item.id} className="k-mb-4" style={{ backgroundColor: '#FBDB93', borderTop: 'none', borderBottom: '1px solid #000000', borderRight: 'none', borderLeft:'none', borderRadius:'0' }}>
                <div className="d-flex align-items-center p-3">
                    {editingId === item.id ? (
                        <Input
                            value={item.task}
                            onChange={(e) => handleTextChange(item.id!, e.value)}
                            className="flex-grow-1 me-3"
                            style={{ color: '#000000',border: 'none', boxShadow: 'none'}}
                        />
                    ) : (
                        <span className="flex-grow-1" style={{ color: '#000000'}}>{item.task}</span>
                    )}
                    {!manageTasks ? <Button
                        svgIcon={editingId === item.id ? plusIcon : pencilIcon}
                        themeColor={editingId === item.id ? "success" : "primary"}
                        fillMode="flat"
                        className="k-mr-2"
                        onClick={() => handleEdit(item.id!)}
                    /> : 
                    <Button
                        svgIcon={plusIcon}
                        themeColor="primary"
                        fillMode="flat"
                        onClick={() => toggleDialog(item.id!)}/>}
                    {!manageTasks ? <Button
                        svgIcon={trashIcon}
                        themeColor="error"
                        fillMode="flat"
                        onClick={() => handleDelete(item.id!)}
                    /> : null}
                </div>
            </Card>
        ));
    };

    return (
       <>
        <div className="section-container">
            <h2 className="mb-4">Daily Todos</h2>
            {!manageTasks ? <div className="d-flex mb-4">
                <Input
                    value={newTaskText}
                    onChange={(e) => setNewTaskText(e.value)}
                    placeholder="Add new task..."
                    className="flex-grow-1 me-2"
                    style={{ border: 'none', borderRadius: 4, padding: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.1)', color: '#000000' }}
                />
                <Button
                    svgIcon={plusIcon}
                    style={{ backgroundColor: '#B45253', color: 'white', border: 'none', marginTop: 8, marginBottom: 8 }}
                    onClick={handleAdd}
                    disabled={!newTaskText.trim()}
                >
                    Add Task
                </Button>
            </div> : null}
            <div className="items-container">
                {renderItems()}
            </div>
        </div>
      {taskSelected && <Dialog title={'Select Task Category'} onClose={() => toggleDialog(null)} className='k-dialog'>
        <div>
            <RadioButton
                name="category"
                value="high"
                label="Must-Do Today"
                defaultChecked={selectedCategory === 'high'}
                onClick={()=> manageTask('high')}
            />
            <br/>
            <RadioButton
                name="category"
                value="low"
                label="Optional For Today"
                defaultChecked={selectedCategory === 'low'}
                onClick={()=> manageTask('low')}/>
            <br />
            <RadioButton
                name="category"
                value="others"
                label="Schedule/Delegate"
                defaultChecked={selectedCategory === 'others'}
                onClick={()=> manageTask('others')}/>
        </div>
      </Dialog>}
      </>
    );
};

export default EssentialsList;
