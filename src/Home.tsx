import React, { useState, useEffect } from 'react';
import { useAuth } from './contexts/AuthContext';
import { supabase } from './supabaseclient';
import { useNavigate } from 'react-router-dom';
import { AppBar, AppBarSection, AppBarSpacer, Drawer, DrawerContent } from '@progress/kendo-react-layout';
import type { DrawerSelectEvent } from '@progress/kendo-react-layout';
import { Button } from '@progress/kendo-react-buttons';
import { menuIcon, calendarIcon, homeIcon, starIcon } from '@progress/kendo-svg-icons';

interface Props {
    children: React.ReactNode;
}

// Define our navigation items
const items = [
    { text: 'Overview', svgIcon: homeIcon, selected: true, route: '/'},
    { text: 'Dashboard', svgIcon: calendarIcon, route: '/dashboard' },
    { text: 'Wishlist', svgIcon: starIcon, route: '/wishlist' },
];

const Home = ({ children }: Props) => {
    const navigate = useNavigate();
    const [expanded, setExpanded] = useState<boolean>(false);
    const [selectedId, setSelectedId] = useState<number>(0);
    
    const handleDrawerToggle = () => {
        setExpanded(!expanded);
    };

    const onSelect = (e: DrawerSelectEvent) => {
        navigate(e.itemTarget.props.route);
        setSelectedId(e.itemIndex);
        setExpanded(false);
    };

    const logoutUser = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Error signing out:', error.message);
        } else {
            navigate('/auth');
        }
    }

    return (
        <React.Fragment>
            <AppBar className="k-appbar">
                <AppBarSection>
                    <Button 
                        svgIcon={menuIcon}
                        fillMode="flat"
                        className="k-button-md mb-0"
                        onClick={handleDrawerToggle}
                        style={{
                            marginTop : 4,
                            color: '#ffffff'
                        }}
                    />
                </AppBarSection>
                <AppBarSpacer style={{ width: 8 }} />
                <AppBarSection>
                    <h2 className="mb-0">WinDay</h2>
                </AppBarSection>
                <AppBarSpacer />
                <AppBarSection>
                    <Button
                        style={{ backgroundColor: '#84994F', color: 'white', marginTop: 8, marginBottom: 8, fontWeight: '600', border:'1px solid #fff', marginRight: '16px' }}
                        className="k-button-md"
                        onClick={() => {
                            logoutUser();
                        }}
                    >
                        Logout
                    </Button>
                </AppBarSection>
            </AppBar>

            <div className='drawer-ctn'>
                <Drawer
                expanded={expanded}
                position={"start"}
                mode={"push"}
                mini={true}
                items={items.map((item, index) => ({
                    ...item,
                    selected: index === selectedId
                }))}
                onSelect={onSelect}
            >
                <DrawerContent>{children}</DrawerContent>
            </Drawer>
            </div>
        </React.Fragment>
    );
}

export default Home;