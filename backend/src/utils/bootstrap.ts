import prisma from '../config/db.js';
import bcrypt from 'bcrypt';

export async function bootstrapDatabase() {
  try {
    console.log('🔄 Bootstrapping default roles and permissions...');

    // 1. Create permissions
    const permissionNames = [
      'member:read', 'member:create', 'member:update', 'member:delete',
      'complaint:read', 'complaint:create', 'complaint:update', 'complaint:delete',
      'notice:read', 'notice:create', 'notice:update', 'notice:delete'
    ];

    const permissionsMap: Record<string, any> = {};
    for (const name of permissionNames) {
      let perm = await prisma.permission.findUnique({ where: { name } });
      if (!perm) {
        perm = await prisma.permission.create({
          data: { name, description: `Allows action ${name}` }
        });
      }
      permissionsMap[name] = perm;
    }

    let defaultSociety = await prisma.society.findFirst();
    if (!defaultSociety) {
      defaultSociety = await prisma.society.create({
        data: {
          name: 'IEEE Society',
          address: '123 Forest Hill Road',
          city: 'Delhi',
          state: 'Delhi',
          zipCode: '110001',
        }
      });
      console.log('👉 Created IEEE Society as default');
    }

    // 3. Ensure default roles for default society
    const rolesToCreate = [
      { name: 'Core Admin', desc: 'Administrator with full management privileges', perms: Object.keys(permissionsMap) },
      {
        name: 'Core Team Lead',
        desc: 'Team leader with write privileges',
        perms: [
          'member:read', 'member:create', 'member:update',
          'complaint:read', 'complaint:create', 'complaint:update',
          'notice:read', 'notice:create', 'notice:update'
        ]
      },
      {
        name: 'General Member',
        desc: 'Standard member with read-only access',
        perms: [
          'member:read', 'complaint:read', 'complaint:create',
          'notice:read'
        ]
      }
    ];

    for (const roleInfo of rolesToCreate) {
      let role = await prisma.role.findFirst({
        where: { name: roleInfo.name, societyId: defaultSociety.id }
      });
      if (!role) {
        role = await prisma.role.create({
          data: {
            name: roleInfo.name,
            description: roleInfo.desc,
            societyId: defaultSociety.id
          }
        });
        console.log(`👉 Created default role: ${roleInfo.name}`);
      }

      // Sync permissions to this role
      for (const pName of roleInfo.perms) {
        const perm = permissionsMap[pName];
        if (perm) {
          const existingRp = await prisma.rolePermission.findUnique({
            where: {
              roleId_permissionId: {
                roleId: role.id,
                permissionId: perm.id
              }
            }
          });
          if (!existingRp) {
            await prisma.rolePermission.create({
              data: {
                roleId: role.id,
                permissionId: perm.id
              }
            });
          }
        }
      }
    }

    // 4. Ensure admin user gou4371@gmail.com exists with Core Admin role
    const adminEmail = 'gou4371@gmail.com';
    const adminPassword = 'Gou@302005';
    const saltRounds = 10;
    const adminPasswordHash = await bcrypt.hash(adminPassword, saltRounds);

    const adminRole = await prisma.role.findFirst({
      where: { name: 'Core Admin', societyId: defaultSociety.id }
    });

    if (adminRole) {
      const existingUser = await prisma.user.findUnique({
        where: { email: adminEmail }
      });

      if (!existingUser) {
        const newUser = await prisma.user.create({
          data: {
            email: adminEmail,
            passwordHash: adminPasswordHash,
            status: 'ACTIVE',
            societyId: defaultSociety.id,
            roleId: adminRole.id
          }
        });
        await prisma.member.create({
          data: {
            userId: newUser.id,
            societyId: defaultSociety.id,
            firstName: 'Gourav',
            lastName: 'Admin',
            phone: '0000000000',
            unitNumber: 'Admin-1',
          }
        });
        console.log(`👉 Created admin user: ${adminEmail}`);
      } else {
        await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            passwordHash: adminPasswordHash,
            roleId: adminRole.id,
            status: 'ACTIVE'
          }
        });
        console.log(`👉 Updated existing user to Core Admin: ${adminEmail}`);
      }

      // 4.5 Seed additional fake members
      const existingMembersCount = await prisma.member.count({
        where: { societyId: defaultSociety.id }
      });
      if (existingMembersCount <= 1) { // only admin exists
        console.log('👉 Seeding dummy members...');
        const generalMemberRole = await prisma.role.findFirst({
          where: { name: 'General Member', societyId: defaultSociety.id }
        });
        const teamLeadRole = await prisma.role.findFirst({
          where: { name: 'Core Team Lead', societyId: defaultSociety.id }
        });

        if (generalMemberRole && teamLeadRole) {
          const fakeUsers = [
            { email: 'alex.rivera@ieee.org', first: 'Alex', last: 'Rivera', role: teamLeadRole.id, unit: 'Block A-1' },
            { email: 'priya.sharma@ieee.org', first: 'Priya', last: 'Sharma', role: teamLeadRole.id, unit: 'Block B-2' },
            { email: 'marcus.chen@ieee.org', first: 'Marcus', last: 'Chen', role: generalMemberRole.id, unit: 'Block C-3' },
            { email: 'elena.rostova@ieee.org', first: 'Elena', last: 'Rostova', role: generalMemberRole.id, unit: 'Block D-4' }
          ];

          for (const fu of fakeUsers) {
            const fuHash = await bcrypt.hash('password123', saltRounds);
            const newUser = await prisma.user.create({
              data: {
                email: fu.email,
                passwordHash: fuHash,
                status: 'ACTIVE',
                societyId: defaultSociety.id,
                roleId: fu.role
              }
            });
            await prisma.member.create({
              data: {
                userId: newUser.id,
                societyId: defaultSociety.id,
                firstName: fu.first,
                lastName: fu.last,
                phone: '1234567890',
                unitNumber: fu.unit,
              }
            });
          }
        }
      }
    }

    // 5. Ensure default meetings exist
    const existingMeetingsCount = await prisma.meeting.count({
      where: { societyId: defaultSociety.id }
    });

    if (existingMeetingsCount === 0) {
      console.log('👉 Seeding default meetings...');
      const meet1 = await prisma.meeting.create({
        data: {
          societyId: defaultSociety.id,
          title: 'Fall Semester Kickoff',
          date: '2026-09-08',
          description: 'Welcome new members, introduce officers, and outline the semester roadmap.',
        }
      });
      const meet2 = await prisma.meeting.create({
        data: {
          societyId: defaultSociety.id,
          title: 'PCB Design Workshop',
          date: '2026-09-22',
          description: 'Hands-on training session on KiCad for designing custom printed circuit boards.',
        }
      });
      await prisma.meeting.create({
        data: {
          societyId: defaultSociety.id,
          title: 'Robotics Team Synch',
          date: '2026-10-06',
          description: 'Reviewing progress on the micromouse project and ordering mechanical parts.',
        }
      });

      // Seed attendance for members
      const activeMembers = await prisma.member.findMany({
        where: { societyId: defaultSociety.id, deletedAt: null }
      });

      if (activeMembers.length > 0) {
        await prisma.attendance.createMany({
          data: activeMembers.flatMap(m => [
            { meetingId: meet1.id, memberId: m.id, status: 'present' },
            { meetingId: meet2.id, memberId: m.id, status: 'unmarked' }
          ]),
          skipDuplicates: true
        });
      }
    }

    // 6. Ensure default tasks exist
    const firstDept = await prisma.department.findFirst({ where: { societyId: defaultSociety.id } });
    const existingTasksCount = await prisma.task.count({
      where: { societyId: defaultSociety.id }
    });

    if (existingTasksCount === 0 && firstDept) {
      console.log('👉 Seeding default tasks...');
      await prisma.task.createMany({
        data: [
          {
            societyId: defaultSociety.id,
            departmentId: firstDept.id,
            title: 'Design Kickoff Flyer',
            description: 'Create a social media flyer and printing posters for the Fall Kickoff event.',
            status: 'completed',
            priority: 'high',
            dueDate: '2026-09-01',
          },
          {
            societyId: defaultSociety.id,
            departmentId: firstDept.id,
            title: 'Order KiCad Parts',
            description: 'Purchase soldering kits, microcontrollers, and components for the workshop.',
            status: 'in_progress',
            priority: 'high',
            dueDate: '2026-09-15',
          },
          {
            societyId: defaultSociety.id,
            departmentId: firstDept.id,
            title: 'Deploy Workshop Registration',
            description: 'Add RSVP forms on the IEEE portal for the upcoming PCB workshop.',
            status: 'todo',
            priority: 'medium',
            dueDate: '2026-09-18',
          },
          {
            societyId: defaultSociety.id,
            departmentId: firstDept.id,
            title: 'Book Room for Industry Panel',
            description: 'Reserve the student union grand hall and request projector configurations.',
            status: 'todo',
            priority: 'medium',
            dueDate: '2026-10-01',
          }
        ]
      });
    }
    // 7. Ensure default projects exist
    const existingProjectsCount = await prisma.project.count({
      where: { societyId: defaultSociety.id }
    });

    if (existingProjectsCount === 0 && firstDept) {
      console.log('👉 Seeding default projects...');
      await prisma.project.createMany({
        data: [
          {
            societyId: defaultSociety.id,
            departmentId: firstDept.id,
            title: 'IEEE Portal Mobile App',
            description: 'React Native mobile companion app for student chapter announcements and QR check-ins.',
            techStack: 'React Native, Expo, TypeScript, Express',
            status: 'DEVELOPMENT',
          },
          {
            societyId: defaultSociety.id,
            departmentId: firstDept.id,
            title: 'Autonomous Micromouse Robot',
            description: 'Custom PCB and flood-fill maze solving robot for regional IEEE competition.',
            techStack: 'C++, STM32, KiCad, Embedded C',
            status: 'DEVELOPMENT',
          },
          {
            societyId: defaultSociety.id,
            departmentId: firstDept.id,
            title: 'Smart Campus IoT Network',
            description: 'LoRaWAN gateway network monitoring ambient temperature and room occupancy.',
            techStack: 'ESP32, Python, MQTT, InfluxDB',
            status: 'IDEATION',
          }
        ]
      });
    }

    // 8. Ensure default events exist
    const existingEventsCount = await prisma.event.count({
      where: { societyId: defaultSociety.id }
    });

    if (existingEventsCount === 0) {
      console.log('👉 Seeding default events...');
      await prisma.event.createMany({
        data: [
          {
            societyId: defaultSociety.id,
            title: 'Annual IEEE Tech Symposium 2026',
            description: 'Keynotes from AI researchers, competitive hackathon, and hardware showcase.',
            startDate: new Date('2026-10-15T09:00:00Z'),
            endDate: new Date('2026-10-16T18:00:00Z'),
            location: 'Main Auditorium & Lab Block B',
            budget: 2500,
          },
          {
            societyId: defaultSociety.id,
            title: 'Hands-on PCB Soldering Bootcamp',
            description: 'Learn SMT component placement, reflow soldering techniques, and circuit testing.',
            startDate: new Date('2026-11-02T14:00:00Z'),
            endDate: new Date('2026-11-02T17:00:00Z'),
            location: 'Electronics Innovation Lab 204',
            budget: 600,
          }
        ]
      });
    }

    // 9. Ensure default complaints exist
    const existingComplaintsCount = await prisma.complaint.count({
      where: { societyId: defaultSociety.id }
    });

    if (existingComplaintsCount === 0) {
      const adminUser = await prisma.user.findFirst({ where: { email: adminEmail } });
      if (adminUser) {
        console.log('👉 Seeding default complaints...');
        await prisma.complaint.createMany({
          data: [
            {
              societyId: defaultSociety.id,
              creatorId: adminUser.id,
              title: 'Lab 204 Soldering Station Exhaust Fan',
              description: 'Exhaust hood motor is vibrating excessively during workshop sessions.',
              category: 'ELECTRICAL',
              priority: 'MEDIUM',
              status: 'OPEN',
            },
            {
              societyId: defaultSociety.id,
              creatorId: adminUser.id,
              title: 'Projector HDMI Audio Input in Hall A',
              description: 'No audio output when connecting laptop via podium HDMI cable.',
              category: 'EQUIPMENT',
              priority: 'LOW',
              status: 'RESOLVED',
            }
          ]
        });
      }
    }

    // 10. Ensure default award rules exist
    const existingAwardsCount = await prisma.awardRule.count({
      where: { societyId: defaultSociety.id }
    });

    if (existingAwardsCount === 0) {
      console.log('👉 Seeding default award rules...');
      await prisma.awardRule.createMany({
        data: [
          {
            societyId: defaultSociety.id,
            awardType: 'MEMBER_OF_MONTH',
            name: 'Member of the Month',
            description: 'Recognizes outstanding participation in chapter workshops and outreach.',
            isActive: true,
          },
          {
            societyId: defaultSociety.id,
            awardType: 'BEST_DEVELOPER',
            name: 'Best Developer Award',
            description: 'Honors top code contributions and pull requests to IEEE chapter projects.',
            isActive: true,
          }
        ]
      });
    }
    // 11. Ensure default departments exist
    const existingDepartmentsCount = await prisma.department.count({
      where: { societyId: defaultSociety.id }
    });

    if (existingDepartmentsCount === 0) {
      console.log('👉 Seeding default departments...');
      const adminUser = await prisma.user.findFirst({ where: { email: adminEmail } });
      const teamLeadRole = await prisma.role.findFirst({ where: { name: 'Core Team Lead', societyId: defaultSociety.id } });
      const generalMemberRole = await prisma.role.findFirst({ where: { name: 'General Member', societyId: defaultSociety.id } });
      
      if (adminUser && teamLeadRole) {
        const techDept = await prisma.department.create({
          data: {
            societyId: defaultSociety.id,
            name: 'Technical Department',
            description: 'Responsible for app development and robotics.',
          }
        });
        
        const prDept = await prisma.department.create({
          data: {
            societyId: defaultSociety.id,
            name: 'PR & Outreach',
            description: 'Handles social media, marketing, and external communications.',
          }
        });

        // Assign admin to the Technical Department
        await prisma.userDepartment.create({
          data: {
            userId: adminUser.id,
            departmentId: techDept.id,
            roleId: teamLeadRole.id,
          }
        });

        // Assign admin to PR department
        await prisma.userDepartment.create({
          data: {
            userId: adminUser.id,
            departmentId: prDept.id,
            roleId: teamLeadRole.id,
          }
        });

        // Assign fake users to departments
        const alex = await prisma.user.findUnique({ where: { email: 'alex.rivera@ieee.org' } });
        const priya = await prisma.user.findUnique({ where: { email: 'priya.sharma@ieee.org' } });
        const marcus = await prisma.user.findUnique({ where: { email: 'marcus.chen@ieee.org' } });
        const elena = await prisma.user.findUnique({ where: { email: 'elena.rostova@ieee.org' } });

        if (alex) {
          await prisma.userDepartment.create({
            data: { userId: alex.id, departmentId: techDept.id, roleId: teamLeadRole.id }
          });
        }
        if (priya) {
          await prisma.userDepartment.create({
            data: { userId: priya.id, departmentId: prDept.id, roleId: teamLeadRole.id }
          });
        }
        if (marcus) {
          await prisma.userDepartment.create({
            data: { userId: marcus.id, departmentId: techDept.id, roleId: generalMemberRole!.id }
          });
        }
        if (elena) {
          await prisma.userDepartment.create({
            data: { userId: elena.id, departmentId: prDept.id, roleId: generalMemberRole!.id }
          });
        }

        
        // Add a department-scoped task
        await prisma.task.create({
          data: {
            societyId: defaultSociety.id,
            departmentId: techDept.id,
            title: 'Deploy API to Production',
            description: 'Finalize CI/CD pipelines for the new portal.',
            status: 'todo',
            priority: 'urgent',
            dueDate: '2026-08-01',
          }
        });
        
        // Add a department-scoped event
        await prisma.event.create({
          data: {
            societyId: defaultSociety.id,
            departmentId: prDept.id,
            title: 'Social Media Campaign Launch',
            description: 'Kickoff for the new Instagram reel series.',
            startDate: new Date('2026-08-10T10:00:00Z'),
            endDate: new Date('2026-08-10T12:00:00Z'),
            location: 'Virtual',
            budget: 50,
          }
        });
      }
    }

    console.log('✅ Database bootstrap completed successfully.');
  } catch (error) {
    console.error('❌ Error during database bootstrap:', error);
  }
}
