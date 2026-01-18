import React from 'react';
import { ChevronRight, ChevronDown, Eye, EyeOff, Lock, Unlock } from 'lucide-react';
import { useUIStore, useSceneStore } from '../../stores';

export function OutlinerPanel() {
  const cells = useSceneStore((state) => state.cells);
  const connections = useSceneStore((state) => state.connections);
  const components = useSceneStore((state) => state.components);
  const groups = useSceneStore((state) => state.groups);
  const selectedUuids = useSceneStore((state) => state.selectedUuids);

  const expanded = useUIStore((state) => state.outlinerExpanded);
  const toggleExpanded = useUIStore((state) => state.toggleOutlinerExpanded);

  const select = useSceneStore((state) => state.select);

  const cellArray = Array.from(cells.values());
  const connectionArray = Array.from(connections.values());
  const componentArray = Array.from(components.values());
  const groupArray = Array.from(groups.values());

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <h2 className="text-lg font-semibold">Outliner</h2>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4">
        <div className="space-y-1">
          {/* Groups */}
          {groupArray.map(group => (
            <OutlinerItem
              key={group.uuid}
              uuid={group.uuid}
              name={group.name}
              type="group"
              expanded={expanded.has(group.uuid)}
              onToggle={() => toggleExpanded(group.uuid)}
              selected={selectedUuids.has(group.uuid)}
              onSelect={() => select([group.uuid], 'replace')}
              visible={group.visible}
              locked={group.locked}
            >
              {/* Group members */}
              {group.memberUuids.map(memberUuid => {
                const cell = cells.get(memberUuid);
                const component = components.get(memberUuid);
                const member = cell || component;

                if (!member) return null;

                const memberName = cell
                  ? `${cell.manufacturer} ${cell.model}`
                  : `Component ${component?.componentType}`;

                return (
                  <OutlinerItem
                    key={memberUuid}
                    uuid={memberUuid}
                    name={memberName}
                    type={cell ? 'cell' : 'component'}
                    selected={selectedUuids.has(memberUuid)}
                    onSelect={() => select([memberUuid], 'replace')}
                    visible={true} // TODO: Add visibility to individual objects
                    locked={false} // TODO: Add locking to individual objects
                  />
                );
              })}
            </OutlinerItem>
          ))}

          {/* Ungrouped Cells */}
          {cellArray
            .filter(cell => !cell.groupId)
            .map(cell => (
              <OutlinerItem
                key={cell.uuid}
                uuid={cell.uuid}
                name={`${cell.manufacturer} ${cell.model}`}
                type="cell"
                selected={selectedUuids.has(cell.uuid)}
                onSelect={() => select([cell.uuid], 'replace')}
                visible={true}
                locked={false}
              />
            ))}

          {/* Components */}
          {componentArray.map(component => (
            <OutlinerItem
              key={component.uuid}
              uuid={component.uuid}
              name={`Component (${component.componentType})`}
              type="component"
              selected={selectedUuids.has(component.uuid)}
              onSelect={() => select([component.uuid], 'replace')}
              visible={true}
              locked={false}
            />
          ))}

          {/* Connections */}
          {connectionArray.length > 0 && (
            <OutlinerItem
              uuid="connections"
              name={`Connections (${connectionArray.length})`}
              type="folder"
              expanded={expanded.has('connections')}
              onToggle={() => toggleExpanded('connections')}
            >
              {connectionArray.map(connection => (
                <OutlinerItem
                  key={connection.uuid}
                  uuid={connection.uuid}
                  name={`Connection (${connection.connectionType})`}
                  type="connection"
                  selected={selectedUuids.has(connection.uuid)}
                  onSelect={() => select([connection.uuid], 'replace')}
                  visible={true}
                  locked={false}
                />
              ))}
            </OutlinerItem>
          )}
        </div>
      </div>
    </div>
  );
}

interface OutlinerItemProps {
  uuid: string;
  name: string;
  type: 'group' | 'cell' | 'component' | 'connection' | 'folder';
  expanded?: boolean;
  onToggle?: () => void;
  selected: boolean;
  onSelect: () => void;
  visible: boolean;
  locked: boolean;
  children?: React.ReactNode;
}

function OutlinerItem({
  uuid,
  name,
  type,
  expanded,
  onToggle,
  selected,
  onSelect,
  visible,
  locked,
  children,
}: OutlinerItemProps) {
  const hasChildren = children && React.Children.count(children) > 0;

  const getIcon = () => {
    switch (type) {
      case 'group':
        return hasChildren ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />) : null;
      case 'cell':
        return <span className="w-2 h-2 bg-green-500 rounded-full"></span>;
      case 'component':
        return <span className="w-2 h-2 bg-blue-500 rounded-full"></span>;
      case 'connection':
        return <span className="w-2 h-2 bg-yellow-500 rounded-full"></span>;
      case 'folder':
        return expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />;
      default:
        return null;
    }
  };

  return (
    <div>
      <div
        className={`flex items-center space-x-2 px-2 py-1 rounded cursor-pointer hover:bg-gray-700 transition-colors ${
          selected ? 'bg-blue-600' : ''
        }`}
        onClick={onSelect}
      >
        <div className="flex items-center space-x-1">
          {hasChildren && onToggle && (
            <button
              className="p-0.5 hover:bg-gray-600 rounded"
              onClick={(e) => {
                e.stopPropagation();
                onToggle();
              }}
            >
              {getIcon()}
            </button>
          )}
          {!hasChildren && getIcon()}
        </div>

        <span className="flex-1 text-sm truncate">{name}</span>

        <div className="flex items-center space-x-1">
          <button
            className="p-1 hover:bg-gray-600 rounded opacity-50 hover:opacity-100"
            title={visible ? 'Hide' : 'Show'}
          >
            {visible ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
          </button>
          <button
            className="p-1 hover:bg-gray-600 rounded opacity-50 hover:opacity-100"
            title={locked ? 'Unlock' : 'Lock'}
          >
            {locked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
          </button>
        </div>
      </div>

      {hasChildren && expanded && (
        <div className="ml-4 mt-1 space-y-1">
          {children}
        </div>
      )}
    </div>
  );
}