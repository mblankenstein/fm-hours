<i18n lang="yaml">
en:
  notFoundEmployee: "Employee not found"
  manageProjects: "Manage Projects"
  customerSearchPlaceholder: "Click or search for a customer here"
  employeeSettings: "Employee Settings"
  admin: "Admin"
  standBy: "Standby"
  endDate: "End date"
  startDate: "Start date"
  noDate: "No date selected"
  editTeam: "Edit team"
nl:
  notFoundEmployee: "Medewerker niet gevonden"
  manageProjects: "Projecten bewerken"
  customerSearchPlaceholder: "Klik of zoek naar een klant"
  employeeSettings: "Medewerker instellingen"
  admin: "Administrator"
  standBy: "Stand-by"
  endDate: "Eind datum"
  startDate: "Start datum"
  noDate: "Geen datum geselecteerd"
  editTeam: "Team bewerken"
</i18n>

<template>
  <div>
    <template v-if="mode !== 'add' && !employee">
      <p>{{ $t('notFoundEmployee') }}</p>
    </template>
    <template v-else>
      <employee-header v-if="mode !== 'add'" :employee="employee" />
      <b-row class="my-5">
        <b-col cols="12" md="6">
          <b-card>
            <h6 class="mb-3">{{ $t('editTeam') }}:</h6>
            <team-selector v-model="selectedTeamId" />
            <project-selector
              :selected-projects="selectedProjects"
              :customers="customers"
              @update-selected-projects="updateSelectedProjects"
            />
          </b-card>
        </b-col>

        <b-col cols="12" md="6">
          <b-card>
            <employee-settings
              :employee="employee"
              @changed="hasUnsavedChanges = true, errorMessage = ''"
              @error-state="handleFormError"
            />
          </b-card>
        </b-col>
      </b-row>
      <div class="d-flex justify-content-end">
        <b-button variant="primary" :disabled="!hasUnsavedChanges" @click="saveEmployee">
          {{ $t('save') }}
          <b-icon icon="file-earmark-arrow-down" class="ml-1" />
        </b-button>
      </div>
      <b-row>
        <b-col cols="12" md="5">
          <b-alert :show="!!errorMessage" variant="danger" class="mt-3 w-4">
            {{ errorMessage }}
          </b-alert>
        </b-col>
      </b-row>
    </template>
  </div>
</template>

<script lang="ts">
import {
  computed,
  defineComponent,
  onMounted,
  PropType,
  ref,
  useContext,
  useMeta,
  useRouter,
  useStore,
  watch,
} from "@nuxtjs/composition-api";

export default defineComponent({
  props: {
    mode: {
      type: String,
      required: true,
      validator: (value: string) => {
        return ['add', 'edit', 'view'].includes(value)
      }
    },
    employee: {
      type: Object as PropType<Employee>,
      required: false,
      default: null
    }
  },
  setup(props: { mode: string, employee: Employee }) {
    const { i18n, localePath } = useContext();
    const router = useRouter();
    const store = useStore<RootStoreState>();

    const projects = computed(() => props.employee?.projects)
    const selectedTeamId = ref<string>();
    const selectedProjects = ref<(Project[] | undefined)>([]);
    const hasUnsavedChanges = ref<boolean>(false);
    const errorMessage = ref<string>("");

    const customers = computed(() => store.state.customers.customers);

    const pageTitle = computed(() =>
      props.employee ? `${i18n.t("employees")} - ${props.employee.name}` : i18n.t("addEmployee") as string
    );

    useMeta(() => ({ title: pageTitle.value }));

    onMounted(() => {
      store.dispatch('customers/getCustomers');
    });

    watch(() => props.employee, () => {
      if (props.employee?.team) {
        selectedTeamId.value = props.employee.team
      }
    }, { immediate: true })

    watch([projects, customers],
      () => {
        if (!props.employee?.projects || !customers.value.length) {
          selectedProjects.value = [];
          return;
        }

        selectedProjects.value = props.employee.projects.map((project: EmployeeProject) => {
          return {
            customer: customers.value.find((customer) => customer.id === project.customerId),
            contract: project.contract
          } as Project;
        });
      },
      { immediate: true, deep: true }
    );

    watch(selectedTeamId,
      (_, prevValue) => {
        if(prevValue !== undefined) {
          hasUnsavedChanges.value = true
        }
      });

    const saveEmployee = async () => {
      const newEmployee = {
        ...props.employee,
        team: selectedTeamId.value,
        projects: selectedProjects.value?.map((project: Project) => {
          return {
            customerId: project.customer.id,
            contract: project.contract
          } as EmployeeProject;
        }),
      };

      if (props.mode === 'edit') {
        await store.dispatch('employees/update', newEmployee);
        hasUnsavedChanges.value = false;
      } else {
        await store.dispatch('employees/add', newEmployee);
        router.push(localePath('/admin/employees'));
      }
    };

    const updateSelectedProjects = (list: Project[]) => {
      selectedProjects.value = list;
      hasUnsavedChanges.value = true;
    }

    const handleFormError = (error: { message: string }) => {
      errorMessage.value = error.message;
    }

    return {
      updateSelectedProjects,
      customers,
      selectedProjects,
      selectedTeamId,
      saveEmployee,
      hasUnsavedChanges,
      errorMessage,
      handleFormError,
    };
  },
  head: {},
});
</script>
