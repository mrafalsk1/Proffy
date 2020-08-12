import React, { useState} from 'react';
import { View, ScrollView, Text, TextInput } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';

import styles from './styles'
import PageHeader from '../../components/PageHeader';
import TeacherItem, { Teacher } from '../../components/TeacherItem';
import { BorderlessButton, RectButton } from 'react-native-gesture-handler';
import { Feather } from '@expo/vector-icons'
import api from '../../services/api';
import { useFocusEffect } from '@react-navigation/native';
function TeacherList() {
    const [isfiltersVisible, setIsFiltersVisible] = useState(false);
    const [teachers, setTeachers] = useState([]);
    const [favorites, setFavorites] = useState<number[]>([]);
    const [subject, setSubject] = useState('');
    const [week_day, setWeek_day] = useState('');
    const [time, setTime] = useState('');
    
    function loadFavorites() {
        AsyncStorage.getItem('favorites').then(response => {
            if (response) {
                const favoritedTeachers = JSON.parse(response);
                const favoritedTeachersIds = favoritedTeachers.map((teacher: Teacher) => {
                    return teacher.id;
                })
                setFavorites(favoritedTeachersIds);
            }
        });
    }
    useFocusEffect(
        React.useCallback(() => {
          loadFavorites();
        }, [])
      )

    function handleToggleFiltersVisible() {
        setIsFiltersVisible(!isfiltersVisible)
    }
    async function handleFiltersSumbit() {
        
        try {
            loadFavorites();
            const response = await api.get('/classes', {
                params: {
                    subject,
                    week_day,
                    time,
                }
            })
            console.log(response.data);
            setIsFiltersVisible(false)
            setTeachers(response.data);
        }catch(e) {
            console.log(e);
            
        }
    }

    return (
        <View style={styles.container}>
            <PageHeader
                title="Proffys disponíveis"
                headerRight={(
                    <BorderlessButton>
                        <Feather onPress={handleToggleFiltersVisible} name="filter" size={20} color="#FFF" />
                    </BorderlessButton>
                )}>
                {isfiltersVisible && (
                    <View style={styles.searchForm}>
                        <Text style={styles.label}>
                            Matérias
                        </Text>
                        <TextInput
                            value={subject}
                            onChangeText={text => setSubject(text)}
                            placeholderTextColor='#c1bccc'
                            style={styles.input}
                            placeholder="Qual a matéria?" />

                        <View style={styles.inputGroup}>
                            <View style={styles.inputBlock}>
                                <Text style={styles.label}>Dia da semana</Text>
                                <TextInput
                                    value={week_day}
                                    onChangeText={text => setWeek_day(text)}
                                    placeholderTextColor='#c1bccc'
                                    style={styles.input}
                                    placeholder="Qual o dia?"
                                ></TextInput>
                            </View>

                            <View style={styles.inputBlock}>
                                <Text style={styles.label}>Horário</Text>
                                <TextInput
                                    value={time}
                                    onChangeText={text => setTime(text)}
                                    placeholderTextColor='#c1bccc'
                                    style={styles.input}
                                    placeholder="Qual horário?"
                                ></TextInput>
                            </View>
                        </View>
                        <RectButton onPress={handleFiltersSumbit} style={styles.submitButton}>
                            <Text style={styles.submitButtonText}>Filtrar</Text>
                        </RectButton>
                    </View>
                )}
            </PageHeader>

            <ScrollView
                style={styles.teacherList}
                contentContainerStyle={{
                    paddingHorizontal: 16,
                    paddingBottom: 16,
                }}
            >
                {teachers.map((teacher: Teacher) => {
                    return <TeacherItem favorited={favorites.includes(teacher.id)} key={teacher.id} teacher={teacher}/>
                })}
            </ScrollView>

        </View>
    )
}

export default TeacherList;