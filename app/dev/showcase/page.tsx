'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import {
  Button, IconButton,
  Input, TextArea, SearchInput,
  Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter,
  Badge, Chip,
  Checkbox, RadioGroup, Select, Switch,
  Table, TableHead, TableBody, TableRow, TableHeader, TableCell,
  Pagination, Tabs,
  Modal, Dialog,
  Spinner, SkeletonLoader,
  Alert, Banner,
  Tooltip,
  Avatar, AvatarGroup,
  Price, PriceRange,
  Rating
} from '@/components/ui';
import { MainLayout } from '@/components/layout';

const container = 'mx-auto max-w-7xl px-4 sm:px-6 lg:px-8';

export default function ShowcasePage() {
  const [modalOpen, setModalOpen] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [radioValue, setRadioValue] = useState('option1');
  const [chipTags, setChipTags] = useState(['React', 'TypeScript']);
  const [currentPage, setCurrentPage] = useState(1);

  return (
    <MainLayout
      navbar={{
        brand: 'A.K.R - UI Showcase',
        items: [{ label: 'Components', href: '#' }],
      }}
      footer={{
        copyright: '© 2026 A.K.R Electronics Design System',
      }}
    >
      <div className={cn(container, 'py-12')}>
        <div className="mb-12">
          <h1 className="text-4xl font-bold text-neutral-900 mb-3">Design System Showcase</h1>
          <p className="text-neutral-600">Development-only page. View all reusable components and their variants.</p>
        </div>

        <Tabs
          tabs={[
            { label: 'Buttons', value: 'buttons', content: <ButtonShowcase /> },
            { label: 'Inputs', value: 'inputs', content: <InputShowcase /> },
            { label: 'Cards', value: 'cards', content: <CardShowcase /> },
            { label: 'Badges', value: 'badges', content: <BadgeShowcase chipTags={chipTags} setChipTags={setChipTags} /> },
            { label: 'Forms', value: 'forms', content: <FormShowcase radioValue={radioValue} setRadioValue={setRadioValue} /> },
            { label: 'Data', value: 'data', content: <DataShowcase currentPage={currentPage} setCurrentPage={setCurrentPage} /> },
            { label: 'Feedback', value: 'feedback', content: <FeedbackShowcase /> },
            { label: 'Media', value: 'media', content: <MediaShowcase /> },
            { label: 'Modals', value: 'modals', content: <ModalsShowcase modalOpen={modalOpen} setModalOpen={setModalOpen} dialogOpen={dialogOpen} setDialogOpen={setDialogOpen} /> },
          ]}
          defaultTab="buttons"
        />
      </div>
    </MainLayout>
  );
}

function ButtonShowcase() {
  return (
    <div className="space-y-8">
      <Section title="Button Variants">
        <div className="flex flex-wrap gap-4">
          <Button variant="primary">Primary</Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="outline">Outline</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="danger">Danger</Button>
        </div>
      </Section>

      <Section title="Button Sizes">
        <div className="flex flex-wrap items-center gap-4">
          <Button size="xs">Extra Small</Button>
          <Button size="sm">Small</Button>
          <Button size="md">Medium</Button>
          <Button size="lg">Large</Button>
          <Button size="xl">Extra Large</Button>
        </div>
      </Section>

      <Section title="Button States">
        <div className="flex flex-wrap gap-4">
          <Button>Enabled</Button>
          <Button disabled>Disabled</Button>
          <Button isLoading>Loading</Button>
          <Button fullWidth>Full Width</Button>
        </div>
      </Section>

      <Section title="Icon Buttons">
        <div className="flex flex-wrap gap-4">
          <IconButton size="sm" variant="ghost">
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.707 2.293a1 1 0 00-1.414 0l-7 7a1 1 0 001.414 1.414L4 10.414V17a1 1 0 001 1h2a1 1 0 001-1v-2a1 1 0 011-1h2a1 1 0 011 1v2a1 1 0 001 1h2a1 1 0 001-1v-6.586l.293.293a1 1 0 001.414-1.414l-7-7z" />
            </svg>
          </IconButton>
          <IconButton size="md" variant="outline">
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 9a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0zm6 0a2 2 0 104 0 2 2 0 00-4 0z" />
            </svg>
          </IconButton>
          <IconButton size="lg" variant="primary">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
              <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM15 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2h-2zM5 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM15 13a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2h-2z" />
            </svg>
          </IconButton>
        </div>
      </Section>
    </div>
  );
}

function InputShowcase() {
  return (
    <div className="space-y-8 max-w-md">
      <Section title="Text Inputs">
        <div className="space-y-4">
          <Input placeholder="Default input" />
          <Input variant="filled" placeholder="Filled input" />
          <Input variant="flushed" placeholder="Flushed input" />
        </div>
      </Section>

      <Section title="With Labels">
        <Input label="Email Address" type="email" placeholder="you@example.com" />
      </Section>

      <Section title="With Validation">
        <div className="space-y-4">
          <Input label="Valid" />
          <Input label="Error" error="This field is required" />
          <Input label="Help Text" helpText="Enter your full name" />
        </div>
      </Section>

      <Section title="Search Input">
        <SearchInput placeholder="Search components..." />
      </Section>

      <Section title="TextArea">
        <TextArea label="Description" placeholder="Enter details..." rows={4} />
      </Section>

      <Section title="Select">
        <Select
          label="Choose option"
          options={[
            { label: 'Option 1', value: '1' },
            { label: 'Option 2', value: '2' },
            { label: 'Option 3', value: '3' },
          ]}
        />
      </Section>
    </div>
  );
}

function CardShowcase() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <Section title="Default Card">
        <Card variant="default">
          <CardHeader>
            <CardTitle>Card Title</CardTitle>
            <CardDescription>This is a card description</CardDescription>
          </CardHeader>
          <CardContent>Content goes here</CardContent>
          <CardFooter>
            <Button size="sm">Action</Button>
          </CardFooter>
        </Card>
      </Section>

      <Section title="Elevated Card">
        <Card variant="elevated">
          <CardHeader>
            <CardTitle>Elevated Card</CardTitle>
          </CardHeader>
          <CardContent>Content with shadow</CardContent>
        </Card>
      </Section>

      <Section title="Outlined Card">
        <Card variant="outlined">
          <CardHeader>
            <CardTitle>Outlined Card</CardTitle>
          </CardHeader>
          <CardContent>Border only variant</CardContent>
        </Card>
      </Section>

      <Section title="Flat Card">
        <Card variant="flat">
          <CardHeader>
            <CardTitle>Flat Card</CardTitle>
          </CardHeader>
          <CardContent>Subtle background variant</CardContent>
        </Card>
      </Section>
    </div>
  );
}

function BadgeShowcase({ chipTags, setChipTags }: any) {
  return (
    <div className="space-y-8">
      <Section title="Badge Variants">
        <div className="flex flex-wrap gap-3">
          <Badge variant="primary">Primary</Badge>
          <Badge variant="secondary">Secondary</Badge>
          <Badge variant="success">Success</Badge>
          <Badge variant="warning">Warning</Badge>
          <Badge variant="error">Error</Badge>
          <Badge variant="neutral">Neutral</Badge>
        </div>
      </Section>

      <Section title="Badge Sizes">
        <div className="flex flex-wrap gap-3">
          <Badge size="sm">Small</Badge>
          <Badge size="md">Medium</Badge>
        </div>
      </Section>

      <Section title="Chips">
        <div className="flex flex-wrap gap-2">
          {chipTags.map((tag: string) => (
            <Chip
              key={tag}
              variant="primary"
              onRemove={() => setChipTags(chipTags.filter((t: string) => t !== tag))}
            >
              {tag}
            </Chip>
          ))}
        </div>
      </Section>
    </div>
  );
}

function FormShowcase({ radioValue, setRadioValue }: any) {
  const [checkedItems, setCheckedItems] = useState({ item1: true, item2: false });
  const [switchValue, setSwitchValue] = useState(true);

  return (
    <div className="space-y-8 max-w-md">
      <Section title="Checkboxes">
        <div className="space-y-3">
          <Checkbox
            label="Accept terms"
            checked={checkedItems.item1}
            onChange={(e) => setCheckedItems({ ...checkedItems, item1: e.target.checked })}
          />
          <Checkbox
            label="Subscribe to newsletter"
            checked={checkedItems.item2}
            onChange={(e) => setCheckedItems({ ...checkedItems, item2: e.target.checked })}
          />
        </div>
      </Section>

      <Section title="Radio Group">
        <RadioGroup
          options={[
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' },
          ]}
          value={radioValue}
          onChange={setRadioValue}
        />
      </Section>

      <Section title="Switch">
        <div className="flex items-center gap-4">
          <Switch
            checked={switchValue}
            onChange={(e) => setSwitchValue(e.target.checked)}
            label="Enable notifications"
          />
        </div>
      </Section>
    </div>
  );
}

function DataShowcase({ currentPage, setCurrentPage }: any) {
  return (
    <div className="space-y-8">
      <Section title="Table">
        <div className="overflow-x-auto">
          <Table>
            <TableHead>
              <TableRow>
                <TableHeader>Name</TableHeader>
                <TableHeader>Email</TableHeader>
                <TableHeader>Status</TableHeader>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell>John Doe</TableCell>
                <TableCell>john@example.com</TableCell>
                <TableCell><Badge variant="success">Active</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Jane Smith</TableCell>
                <TableCell>jane@example.com</TableCell>
                <TableCell><Badge variant="primary">Pending</Badge></TableCell>
              </TableRow>
              <TableRow>
                <TableCell>Bob Wilson</TableCell>
                <TableCell>bob@example.com</TableCell>
                <TableCell><Badge variant="error">Inactive</Badge></TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </Section>

      <Section title="Pagination">
        <div className="flex justify-center">
          <Pagination
            currentPage={currentPage}
            totalPages={10}
            onPageChange={setCurrentPage}
          />
        </div>
      </Section>

      <Section title="Tabs">
        <Tabs
          tabs={[
            { label: 'Tab 1', value: 'tab1', content: <p>Content for tab 1</p> },
            { label: 'Tab 2', value: 'tab2', content: <p>Content for tab 2</p> },
            { label: 'Tab 3', value: 'tab3', content: <p>Content for tab 3</p> },
          ]}
          defaultTab="tab1"
        />
      </Section>
    </div>
  );
}

function FeedbackShowcase() {
  return (
    <div className="space-y-8">
      <Section title="Alerts">
        <div className="space-y-3">
          <Alert variant="success" title="Success" dismissible>
            Operation completed successfully.
          </Alert>
          <Alert variant="warning" title="Warning">
            Please review before proceeding.
          </Alert>
          <Alert variant="error" title="Error" dismissible>
            Something went wrong. Please try again.
          </Alert>
          <Alert variant="info" title="Info">
            This is an informational message.
          </Alert>
        </div>
      </Section>

      <Section title="Banner">
        <div className="space-y-2">
          <Banner variant="success">Success banner message</Banner>
          <Banner variant="warning">Warning banner message</Banner>
          <Banner variant="error">Error banner message</Banner>
          <Banner variant="info">Info banner message</Banner>
        </div>
      </Section>

      <Section title="Spinners">
        <div className="flex gap-6">
          <div className="text-center">
            <Spinner size="sm" />
            <p className="text-sm mt-2">Small</p>
          </div>
          <div className="text-center">
            <Spinner size="md" />
            <p className="text-sm mt-2">Medium</p>
          </div>
          <div className="text-center">
            <Spinner size="lg" />
            <p className="text-sm mt-2">Large</p>
          </div>
        </div>
      </Section>

      <Section title="Skeleton Loader">
        <SkeletonLoader count={3} />
      </Section>

      <Section title="Tooltips">
        <div className="flex flex-wrap gap-4">
          <Tooltip content="Top tooltip" position="top">
            <Button variant="outline">Hover me (top)</Button>
          </Tooltip>
          <Tooltip content="Right tooltip" position="right">
            <Button variant="outline">Hover me (right)</Button>
          </Tooltip>
          <Tooltip content="Bottom tooltip" position="bottom">
            <Button variant="outline">Hover me (bottom)</Button>
          </Tooltip>
          <Tooltip content="Left tooltip" position="left">
            <Button variant="outline">Hover me (left)</Button>
          </Tooltip>
        </div>
      </Section>
    </div>
  );
}

function MediaShowcase() {
  return (
    <div className="space-y-8">
      <Section title="Avatars">
        <div className="flex items-center gap-4">
          <Avatar initials="JD" />
          <Avatar initials="JS" />
          <Avatar
            src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"
            alt="User"
          />
        </div>
      </Section>

      <Section title="Avatar Group">
        <AvatarGroup
          avatars={[
            { initials: 'JD' },
            { initials: 'JS' },
            { initials: 'BW' },
            { initials: 'MS' },
          ]}
          max={3}
        />
      </Section>

      <Section title="Price Display">
        <div className="space-y-4">
          <Price amount={999} />
          <Price amount={799} original={999} highlight />
          <PriceRange min={500} max={2000} />
        </div>
      </Section>

      <Section title="Rating">
        <div className="space-y-4">
          <div>
            <p className="text-sm mb-2">Read-only rating</p>
            <Rating value={4} readonly showCount count={128} />
          </div>
          <div>
            <p className="text-sm mb-2">Interactive rating</p>
            <Rating value={0} onChange={() => {}} />
          </div>
        </div>
      </Section>
    </div>
  );
}

function ModalsShowcase({ modalOpen, setModalOpen, dialogOpen, setDialogOpen }: any) {
  return (
    <div className="space-y-8">
      <Section title="Modal">
        <Button onClick={() => setModalOpen(true)}>Open Modal</Button>
        <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Modal Title" size="md">
          <p>This is a modal dialog with custom content.</p>
          <p className="mt-4 text-neutral-600">You can add any content here including forms, images, etc.</p>
        </Modal>
      </Section>

      <Section title="Dialog">
        <Button onClick={() => setDialogOpen(true)} variant="secondary">
          Open Dialog
        </Button>
        <Dialog
          isOpen={dialogOpen}
          onClose={() => setDialogOpen(false)}
          title="Confirm Action"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={() => setDialogOpen(false)}>Confirm</Button>
            </div>
          }
        >
          <p>Are you sure you want to proceed with this action?</p>
        </Dialog>
      </Section>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">{title}</h3>
      <div className="p-4 bg-neutral-50 rounded-lg border border-neutral-200">{children}</div>
    </div>
  );
}
